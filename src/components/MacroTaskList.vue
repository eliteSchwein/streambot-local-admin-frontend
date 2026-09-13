<template>
  <div class="macro-task-list" :class="{ 'macro-task-list--nested': nested }">
    <v-expansion-panels v-if="items.length" variant="accordion" multiple>
      <component
        :is="componentFor(item)"
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :index="index"
        :panel-value="item.id"
        :depth="depth"
        :task-list-component="currentTaskListComponent"
        :preset-title-key="presetMetaFor(item)?.titleKey || ''"
        :preset-icon="presetMetaFor(item)?.icon || ''"
        :inside-loop="isItemInsideLoop(item)"
        :can-move-up="index > 0"
        :can-move-down="index < items.length - 1"
        @remove="removeItem(index)"
        @move-up="moveItem(index, -1)"
        @move-down="moveItem(index, 1)"
      />
    </v-expansion-panels>

    <v-alert
      v-else
      type="info"
      color="warning"
      density="comfortable"
      variant="tonal"
      class="mb-3"
      :text="$t('components.macroTaskList.noTasksYet')"
    />

    <v-btn
      prepend-icon="mdi-plus"
      variant="tonal"
      color="primary"
      size="small"
      class="mt-3"
      @click="addTaskDialogOpen = true"
    >
      {{ $t('components.macroTaskList.addTask') }}
    </v-btn>

    <MacroTaskAddDialog
      v-model="addTaskDialogOpen"
      :presets="availablePresets"
      @select="addPreset"
    />
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import * as macroTaskModule from '@/components/accordions/macro'
import { buildMacroTaskPresets, findMacroTaskPreset } from '@/components/accordions/macro/preset-registry'
import MacroTaskAddDialog from '@/components/dialogs/MacroTaskAddDialog.vue'

const macroTaskComponents = Object.fromEntries(
  Object.entries(macroTaskModule).filter(([name]) => name.startsWith('Macro')),
)

export default {
  name: 'MacroTaskList',

  provide() {
    return {
      MacroTaskListComponent: this.$options,
    }
  },

  components: {
    ...macroTaskComponents,
    MacroTaskAddDialog,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    nested: {
      type: Boolean,
      default: false,
    },
    taskListComponent: {
      type: [Object, Function, String],
      default: null,
    },
    insideLoop: {
      type: Boolean,
      default: false,
    },
    insideSwitch: {
      type: Boolean,
      default: false,
    },
  },

  watch: {
    items: {
      immediate: true,
      deep: true,
      handler() {
        this.ensureItemIds(this.items as any[])
      },
    },
  },

  computed: {
    ...mapState(useAppStore, ['getIntegrations', 'hasOllamaEnabled']),

    currentTaskListComponent(): any {
      return this.taskListComponent || this.$options
    },

    hasYoloboxEnabled(): boolean {
      const integrations = this.getIntegrations || {}

      return Boolean(integrations.yolobox?.enabled)
    },

    availablePresets(): any[] {
      const presets = this.filterPresets(buildMacroTaskPresets())

      if (this.hasYoloboxEnabled) {
        return presets
      }

      return presets.filter((preset: any) => preset.titleKey !== 'macro.presets.yolobox.title')
    },
  },

  data() {
    return {
      addTaskDialogOpen: false,
    }
  },

  methods: {
    presetMetaFor(item: any) {
      return findMacroTaskPreset(item)
    },

    filterPresets(presets: any[]): any[] {
      return presets
        .map((preset: any) => {
          if (preset.loopOnly === true && !this.insideLoop) return null
          if (preset.switchOnly === true && !this.insideSwitch) return null
          if (preset.ollamaOnly === true && !this.hasOllamaEnabled) return null

          if (!preset.children?.length) return preset

          const children = this.filterPresets(preset.children)
          if (!children.length) return null

          return {
            ...preset,
            children,
          }
        })
        .filter(Boolean)
    },

    componentFor(item: any) {
      if (item?.type === 'condition') return 'MacroConditionTaskAccordion'
      if (item?.type === 'loop' || (item?.task?.channel === 'loop' && item?.task?.method === 'for')) return 'MacroLoopTaskAccordion'
      if (item?.task?.channel === 'loop' && ['break', 'continue', 'end_for'].includes(item?.task?.method)) return 'MacroLoopControlTaskAccordion'
      if (item?.task?.channel === 'condition' && item?.task?.method === 'end_macro') return 'MacroEndMacroTaskAccordion'
      if (item?.type === 'switch' || (item?.task?.channel === 'switch' && item?.task?.method === 'switch')) return 'MacroSwitchTaskAccordion'
      if (item?.task?.channel === 'switch' && item?.task?.method === 'break') return 'MacroSwitchBreakTaskAccordion'
      if (item?.task?.channel === 'function') {
        const functionComponentsByMethod: Record<string, string> = {
          announce: 'MacroFunctionAnnounceTaskAccordion',
          dump_variables: 'MacroFunctionDumpVariablesTaskAccordion',
          parallel: 'MacroFunctionParallelTaskAccordion',
          random: 'MacroFunctionRandomTaskAccordion',
          send_dm: 'MacroFunctionSendDmTaskAccordion',
          send_message: 'MacroFunctionSendMessageTaskAccordion',
          sleep: 'MacroFunctionSleepTaskAccordion',
          song_request: 'MacroFunctionSongRequestTaskAccordion',
          song_request_toggle: 'MacroFunctionSongRequestToggleTaskAccordion',
          speak: 'MacroFunctionSpeakTaskAccordion',
          strip_emojis: 'MacroFunctionStripEmojisTaskAccordion',
        }

        return functionComponentsByMethod[item?.task?.method] ?? 'MacroFunctionTaskAccordion'
      }

      if (item?.task?.channel === 'ollama' && item?.task?.method === 'chat') {
        return 'MacroOllamaChatTaskAccordion'
      }

      if (item?.task?.channel === 'timer') {
        if (item?.task?.method === 'add_time') return 'MacroTimerAddTimeTaskAccordion'
        if (item?.task?.method === 'reduce_time') return 'MacroTimerReduceTimeTaskAccordion'
        if (item?.task?.method === 'pause') return 'MacroTimerPauseTaskAccordion'
        if (item?.task?.method === 'stop') return 'MacroTimerStopTaskAccordion'
        return 'MacroTimerStartTaskAccordion'
      }

      if (item?.task?.channel === 'variable' && item?.task?.method === 'get') {
        return 'MacroVariableGetTaskAccordion'
      }

      if (item?.task?.channel === 'variable' && item?.task?.method === 'set') {
        return 'MacroVariableSetTaskAccordion'
      }

      if (item?.task?.channel === 'variable' && item?.task?.method === 'local_set') {
        return 'MacroVariableLocalSetTaskAccordion'
      }

      if (item?.task?.channel === 'channel_point' && item?.task?.method === 'accept') {
        return 'MacroChannelPointAcceptTaskAccordion'
      }

      if (item?.task?.channel === 'channel_point' && item?.task?.method === 'cancel') {
        return 'MacroChannelPointCancelTaskAccordion'
      }

      if (item?.task?.channel === 'channel_point' && ['pause', 'unpause'].includes(item?.task?.method)) {
        return 'MacroChannelPointPauseTaskAccordion'
      }

      if (item?.task?.channel === 'channel_point' && item?.task?.method === 'enable') {
        return 'MacroChannelPointEnableTaskAccordion'
      }

      if (item?.task?.channel === 'channel_point' && item?.task?.method === 'disable') {
        return 'MacroChannelPointDisableTaskAccordion'
      }


      if (item?.task?.channel === 'command') {
        const commandComponentsByMethod: Record<string, string> = {
          disable: 'MacroCommandDisableTaskAccordion',
          enable: 'MacroCommandEnableTaskAccordion',
          reset: 'MacroCommandResetTaskAccordion',
          reset_all: 'MacroCommandResetAllTaskAccordion',
          set: 'MacroCommandSetTaskAccordion',
        }

        return commandComponentsByMethod[item?.task?.method] ?? 'MacroTaskAccordion'
      }

      if (item?.task?.channel === 'api_request') {
        if (item?.task?.method === 'get') return 'MacroApiGetTaskAccordion'
        if (item?.task?.method === 'post') return 'MacroApiPostTaskAccordion'
        if (item?.task?.method === 'put') return 'MacroApiPutTaskAccordion'
        if (item?.task?.method === 'patch') return 'MacroApiPatchTaskAccordion'
        if (item?.task?.method === 'delete') return 'MacroApiDeleteTaskAccordion'
      }

      if (item?.task?.channel === 'theme') {
        if (item?.task?.method === 'set_color') return 'MacroThemeSetColorTaskAccordion'
        if (item?.task?.method === 'restore_color') return 'MacroThemeRestoreColorTaskAccordion'
      }

      if (item?.task?.channel === 'keyboard') {
        return 'MacroKeyboardTaskAccordion'
      }

      if (item?.task?.channel === 'system') {
        if (['shutdown', 'halt', 'poweroff'].includes(item?.task?.method)) {
          return 'MacroSystemShutdownTaskAccordion'
        }
        if (['reboot', 'restart'].includes(item?.task?.method)) {
          return 'MacroSystemRebootTaskAccordion'
        }
      }

      if (item?.task?.channel === 'wled' && item?.task?.method === 'custom') {
        return 'MacroWledCustomTaskAccordion'
      }

      if (item?.task?.channel === 'wled' && item?.task?.method === 'off') {
        return 'MacroWledOffTaskAccordion'
      }

      if (item?.task?.channel === 'auto_macro') {
        if (['stop', 'disable'].includes(item?.task?.method)) return 'MacroAutoMacroStopTaskAccordion'
        return 'MacroAutoMacroStartTaskAccordion'
      }

      if (item?.task?.channel === 'rotate_scene') {
        if (item?.task?.method === 'stop') return 'MacroRotateSceneStopTaskAccordion'
        return 'MacroRotateSceneStartTaskAccordion'
      }

      if (item?.task?.channel === 'twitch') {
        if (item?.task?.method === 'clip') return 'MacroTwitchClipTaskAccordion'
        if (item?.task?.method === 'shoutout') return 'MacroTwitchShoutoutTaskAccordion'
        if (item?.task?.method === 'set_category') return 'MacroTwitchCategoryTaskAccordion'
        if (item?.task?.method === 'enable_random_clip') return 'MacroTwitchEnableRandomClipTaskAccordion'
        if (item?.task?.method === 'disable_random_clip') return 'MacroTwitchDisableRandomClipTaskAccordion'
        if (item?.task?.method === 'poll') {
          if (item?.task?.data?.action === 'archive') return 'MacroTwitchPollArchiveTaskAccordion'
          if (item?.task?.data?.action === 'terminate') return 'MacroTwitchPollTerminateTaskAccordion'
          return 'MacroTwitchPollCreateTaskAccordion'
        }
        if (item?.task?.method === 'prediction') {
          if (item?.task?.data?.action === 'lock') return 'MacroTwitchPredictionLockTaskAccordion'
          if (item?.task?.data?.action === 'resolve') return 'MacroTwitchPredictionResolveTaskAccordion'
          if (item?.task?.data?.action === 'cancel') return 'MacroTwitchPredictionCancelTaskAccordion'
          return 'MacroTwitchPredictionCreateTaskAccordion'
        }
        if (item?.task?.method === 'stream_marker') return 'MacroTwitchStreamMarkerTaskAccordion'
        if (item?.task?.method === 'vip') {
          if (item?.task?.data?.action === 'remove') return 'MacroTwitchVipRemoveTaskAccordion'
          return 'MacroTwitchVipAddTaskAccordion'
        }
        if (item?.task?.method === 'ban') return 'MacroTwitchBanTaskAccordion'
        if (item?.task?.method === 'timeout') return 'MacroTwitchTimeoutTaskAccordion'
        if (item?.task?.method === 'ad') return 'MacroTwitchAdTaskAccordion'
      }

      if (item?.task?.channel === 'yolobox') {
        if (item.task.method === 'switch_video_source') return 'MacroYoloboxVideoSourceTaskAccordion'
        if (['set_overlay', 'order_material_change'].includes(item.task.method)) return 'MacroYoloboxOverlayTaskAccordion'
        if (item.task.method === 'set_audio_volume') return 'MacroYoloboxAudioVolumeTaskAccordion'
        if (item.task.method === 'order_mixer_change' && item.task.data?.volume !== undefined) return 'MacroYoloboxAudioVolumeTaskAccordion'
        if (['set_audio_muted', 'order_mixer_change'].includes(item.task.method) && item.task.data?.volume === undefined) return 'MacroYoloboxAudioMuteTaskAccordion'
        if (item.task.method === 'set_audio_delay') return 'MacroYoloboxAudioDelayTaskAccordion'
        if (item.task.method === 'set_audio_afv') return 'MacroYoloboxAudioAfvTaskAccordion'
        if (['set_live_status', 'order_live_status'].includes(item.task.method)) return 'MacroYoloboxLiveStatusTaskAccordion'
      }

      if (item?.task?.channel === 'obs') {
        const data = item?.task?.data ?? {}

        if (item?.task?.method === 'SetCurrentProgramScene') return 'MacroObsSwitchSceneTaskAccordion'
        if (item?.task?.method === 'SetCurrentPreviewScene') return 'MacroObsSwitchPreviewSceneTaskAccordion'

        if (item?.task?.method === 'SetSceneItemEnabled') {
          if (data.sceneItemEnabled === false) return 'MacroObsHideSceneItemTaskAccordion'
          if (data.sceneItemEnabled === true) return 'MacroObsShowSceneItemTaskAccordion'
          return 'MacroObsToggleSceneItemTaskAccordion'
        }

        if (item?.task?.method === 'SetSceneItemLocked') {
          if (data.sceneItemLocked === false) return 'MacroObsUnlockSceneItemTaskAccordion'
          return 'MacroObsLockSceneItemTaskAccordion'
        }

        if (item?.task?.method === 'SetSceneItemTransform') return 'MacroObsTransformSceneItemTaskAccordion'
        if (item?.task?.method === 'SetInputMute') {
          if (data.inputMuted === false) return 'MacroObsUnmuteInputTaskAccordion'
          if (data.inputMuted === true) return 'MacroObsMuteInputTaskAccordion'
          return 'MacroObsSetInputMuteTaskAccordion'
        }
        if (item?.task?.method === 'ToggleInputMute') return 'MacroObsToggleInputMuteTaskAccordion'
        if (item?.task?.method === 'SetInputVolume') return 'MacroObsSetInputVolumeTaskAccordion'

        if (item?.task?.method === 'transition_source_filter') return 'MacroObsTransitionSourceFilterTaskAccordion'

        if (item?.task?.method === 'SetSourceFilterEnabled') {
          if (data.filterEnabled === false) return 'MacroObsDisableSourceFilterTaskAccordion'
          return 'MacroObsEnableSourceFilterTaskAccordion'
        }

        if (item?.task?.method === 'StartStream') return 'MacroObsStartStreamTaskAccordion'
        if (item?.task?.method === 'StopStream') return 'MacroObsStopStreamTaskAccordion'
        if (item?.task?.method === 'StartRecord') return 'MacroObsStartRecordTaskAccordion'
        if (item?.task?.method === 'StopRecord') return 'MacroObsStopRecordTaskAccordion'
        if (item?.task?.method === 'PauseRecord') return 'MacroObsPauseRecordTaskAccordion'
        if (item?.task?.method === 'ResumeRecord') return 'MacroObsResumeRecordTaskAccordion'
        if (item?.task?.method === 'GetSourceScreenshot') return 'MacroObsScreenshotTaskAccordion'
        if (item?.task?.method === 'get_output_screenshot') return 'MacroObsScreenshotTaskAccordion'
        if (item?.task?.method === 'StartReplayBuffer') return 'MacroObsStartReplayBufferTaskAccordion'
        if (item?.task?.method === 'StopReplayBuffer') return 'MacroObsStopReplayBufferTaskAccordion'
        if (item?.task?.method === 'SaveReplayBuffer') return 'MacroObsSaveReplayBufferTaskAccordion'
        if (item?.task?.method === 'reload_browser_sources') return 'MacroObsReloadBrowserSourcesTaskAccordion'
        if (item?.task?.method === 'TriggerHotkeyByName') return 'MacroObsTriggerHotkeyTaskAccordion'
        if (item?.task?.method === 'SetCurrentProfile') return 'MacroObsSetProfileTaskAccordion'
        if (item?.task?.method === 'SetCurrentSceneCollection') return 'MacroObsSetSceneCollectionTaskAccordion'
      }

      if (item?.task?.channel === 'audio') {
        const audioComponentsByMethod: Record<string, string> = {
          set_volume: 'MacroAudioSetVolumeTaskAccordion',
          adjust_volume: 'MacroAudioAdjustVolumeTaskAccordion',
          relative_volume: 'MacroAudioAdjustVolumeTaskAccordion',
          load_preset: 'MacroAudioLoadPresetTaskAccordion',
        }

        return audioComponentsByMethod[item?.task?.method] ?? 'MacroTaskAccordion'
      }

      if (item?.task?.channel === 'music') {
        const musicComponentsByMethod: Record<string, string> = {
          play: 'MacroMusicPlayTaskAccordion',
          pause: 'MacroMusicPauseTaskAccordion',
          toggle_pause: 'MacroMusicTogglePauseTaskAccordion',
          back: 'MacroMusicPreviousTaskAccordion',
          previous: 'MacroMusicPreviousTaskAccordion',
          prev: 'MacroMusicPreviousTaskAccordion',
          next: 'MacroMusicNextTaskAccordion',
          stop: 'MacroMusicStopTaskAccordion',          shuffle: 'MacroMusicShuffleTaskAccordion',
          loop: 'MacroMusicLoopTaskAccordion',
          loop_playlist: 'MacroMusicLoopTaskAccordion',
          loop_file: 'MacroMusicLoopFileTaskAccordion',
          play_song: 'MacroMusicPlaySongTaskAccordion',
          song: 'MacroMusicPlaySongTaskAccordion',
          reload: 'MacroMusicReloadTaskAccordion',
          song_request: 'MacroMusicSongRequestTaskAccordion',
          song_request_toggle: 'MacroMusicToggleSongRequestsTaskAccordion',
          toggle_song_request: 'MacroMusicToggleSongRequestsTaskAccordion',
        }

        return musicComponentsByMethod[item?.task?.method] ?? 'MacroMusicTaskAccordion'
      }

      if (item?.task?.channel === 'media' && item?.task?.method === 'clear_media') {
        return 'MacroClearMediaTaskAccordion'
      }

      if (item?.task?.channel === 'media' && item?.task?.method === 'ffmpeg') {
        return 'MacroFfmpegTaskAccordion'
      }

      const componentsByChannel: Record<string, string> = {
        alert: 'MacroAlertTaskAccordion',
        dummy_alert: 'MacroDummyAlertTaskAccordion',
        function: 'MacroFunctionTaskAccordion',
        websocket: 'MacroWebsocketTaskAccordion',
        macro: 'MacroMacroTaskAccordion',
        file: 'MacroFileTaskAccordion',
        media: 'MacroMediaTaskAccordion',
        webhook: 'MacroWebhookTaskAccordion',
        neopixel: 'MacroNeopixelTaskAccordion',
        effect: 'MacroEffectTaskAccordion',
        animation: 'MacroAnimationTaskAccordion',
        rest: 'MacroRestTaskAccordion',
        obs: 'MacroObsTaskAccordion',
        music: 'MacroMusicTaskAccordion',
      }

      return componentsByChannel[item?.task?.channel] ?? 'MacroTaskAccordion'
    },

    uid() {
      return `${Date.now()}_${Math.random().toString(16).slice(2)}`
    },

    createTask(task: any) {
      return {
        id: this.uid(),
        type: 'task',
        task,
      }
    },

    createApiRequestTask(method: 'get' | 'post' | 'put' | 'patch' | 'delete') {
      const supportsBody = method !== 'get'

      return this.createTask({
        channel: 'api_request',
        method,
        data: {
          url: '',
          result_variable: 'api_response',
          headers: {},
          query: {},
          timeout: 30000,
          fail_on_error: false,
          ...(supportsBody
            ? {
              body_type: 'json',
              body_data: {},
              form_data: {},
            }
            : {}),
        },
      })
    },

    createConditionTask() {
      return {
        id: this.uid(),
        type: 'condition',
        task: {
          channel: 'condition',
          method: 'if',
          check: '',
        },
        children: [],
        branches: [],
      }
    },

    createLoopTask() {
      return {
        id: this.uid(),
        type: 'loop',
        task: {
          channel: 'loop',
          method: 'for',
          data: {
            key: 'item',
            from: 1,
            to: 10,
          },
        },
        children: [],
      }
    },


    createSwitchTask() {
      return {
        id: this.uid(),
        type: 'switch',
        task: {
          channel: 'switch',
          method: 'switch',
          data: {
            input: '',
          },
        },
        cases: [],
      }
    },

    isItemInsideLoop(item: any) {
      return this.insideLoop || item?.type === 'loop' || (item?.task?.channel === 'loop' && item?.task?.method === 'for')
    },

    ensureItemIds(items: any[]) {
      for (const item of items ?? []) {
        if (!item || typeof item !== 'object') continue

        if (!item.id) {
          item.id = this.uid()
        }

        if (Array.isArray(item.children)) {
          this.ensureItemIds(item.children)
        }

        if (Array.isArray(item.branches)) {
          for (const branch of item.branches) {
            if (Array.isArray(branch?.children)) {
              this.ensureItemIds(branch.children)
            }
          }
        }

        if (Array.isArray(item.cases)) {
          for (const switchCase of item.cases) {
            if (Array.isArray(switchCase?.children)) {
              this.ensureItemIds(switchCase.children)
            }
          }
        }
      }
    },

    addTask(item: any) {
      this.ensureItemIds([item])
      ;(this.items as any[]).push(item)
    },

    addPreset(preset: any) {
      if (typeof preset?.create !== 'function') return
      this.addTask(preset.create())
    },

    removeItem(index: number) {
      ;(this.items as any[]).splice(index, 1)
    },

    moveItem(index: number, direction: number) {
      const target = index + direction
      const items = this.items as any[]

      if (target < 0 || target >= items.length) return

      const [item] = items.splice(index, 1)
      items.splice(target, 0, item)
    },
  },
}
</script>

<style scoped>
.macro-task-list--nested {
  border-left: 2px solid rgba(var(--v-theme-primary), .45);
  padding-left: 12px;
  margin-left: 4px;
}
</style>

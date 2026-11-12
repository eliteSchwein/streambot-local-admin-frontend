<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-video-switch-outline" />
        <span class="text-truncate">{{ $t('dashboard.customize.cards.obs_scenes') }}</span>
      </v-toolbar-title>
      <template #append>
        <v-chip size="x-small" variant="tonal">{{ connection }}</v-chip>
      </template>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert
        v-if="scenes.length === 0"
        type="info"
        color="grey-darken-3"
        density="compact"
        :text="$t('obs.settings.empty')"
      />

      <div v-else class="d-flex flex-column ga-2">
        <div v-for="group in canvasGroups" :key="group.key">
          <div
            v-if="canvasGroups.length > 1 && group.name"
            class="text-caption text-medium-emphasis d-flex align-center ga-1 mb-1"
          >
            <v-icon icon="mdi-monitor-dashboard" size="x-small" />
            {{ group.name }}
          </div>

          <v-expansion-panels
            v-model="openScenes"
            multiple
            variant="accordion"
            class="dashboard-obs-scenes"
          >
            <v-expansion-panel
              v-for="scene in group.scenes"
              :key="sceneKey(scene)"
              :value="sceneKey(scene)"
              :color="isActive(scene) ? 'primary' : undefined"
              class="dashboard-obs-scene"
              :class="{
                'dashboard-obs-scene--active': isActive(scene),
                'dashboard-obs-scene--switching': isSwitching(scene),
              }"
            >
              <v-expansion-panel-title class="dashboard-obs-scene__title">
                <div class="d-flex align-center ga-2 w-100 min-width-0 pr-2">
                  <span class="text-truncate flex-grow-1">{{ sceneName(scene) }}</span>

                  <v-fade-transition mode="out-in">
                    <v-chip
                      v-if="isSwitching(scene)"
                      key="switching"
                      size="x-small"
                      :variant="isActive(scene) ? 'flat' : 'tonal'"
                      :color="isActive(scene) ? 'surface' : 'primary'"
                    >
                      {{ $t('obs.settings.switching') }}
                    </v-chip>
                    <v-chip
                      v-else-if="isActive(scene)"
                      key="live"
                      size="x-small"
                      variant="flat"
                      color="surface"
                    >
                      {{ $t('obs.settings.activeScene') }}
                    </v-chip>
                    <v-btn
                      v-else
                      key="switch"
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      icon="mdi-play"
                      density="comfortable"
                      :title="$t('obs.settings.switchTo')"
                      @click.stop="switchScene(scene)"
                    />
                  </v-fade-transition>
                </div>

                <v-progress-linear
                  :active="isSwitching(scene)"
                  indeterminate
                  absolute
                  location="bottom"
                  color="primary"
                  height="2"
                />
              </v-expansion-panel-title>

              <v-expansion-panel-text class="dashboard-obs-scene__content">
                <div
                  v-if="sceneSources(scene).length === 0"
                  class="text-caption text-medium-emphasis py-1"
                >
                  {{ $t('obs.settings.noSources') }}
                </div>

                <div v-for="entry in sceneSources(scene)" :key="entry.key">
                  <div
                    class="dashboard-obs-source"
                    :class="{ 'dashboard-obs-source--disabled': !isSourceEnabled(entry.item) }"
                    :style="{ paddingLeft: `${entry.depth * 14}px` }"
                  >
                    <v-icon :icon="sourceIcon(entry.item)" size="small" class="dashboard-obs-source__icon" />
                    <span class="text-body-2 text-truncate flex-grow-1 dashboard-obs-source__name">{{ entry.name }}</span>
                    <v-btn
                      v-if="entry.device"
                      size="x-small"
                      variant="tonal"
                      :color="entry.device.muted ? 'error' : undefined"
                      :prepend-icon="entry.device.muted ? 'mdi-volume-variant-off' : 'mdi-volume-source'"
                      :append-icon="audioOpen.includes(entry.key) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                      :title="$t('obs.settings.audio')"
                      @click="toggleAudio(entry.key)"
                    />
                    <v-switch
                      :model-value="isSourceEnabled(entry.item)"
                      color="primary"
                      density="compact"
                      hide-details
                      class="dashboard-obs-source__toggle"
                      :title="isSourceEnabled(entry.item) ? $t('obs.settings.disable') : $t('obs.settings.enable')"
                      @update:model-value="(enabled) => setSourceEnabled(entry.item, scene, Boolean(enabled))"
                    />
                  </div>
                  <v-expand-transition>
                    <ObsAudioControl
                      v-if="entry.device && audioOpen.includes(entry.key)"
                      :device="entry.device"
                      :connection="connection"
                      class="pb-1"
                      :style="{ paddingLeft: `${entry.depth * 14}px` }"
                    />
                  </v-expand-transition>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import ObsAudioControl from '@/components/obs/ObsAudioControl.vue'
import { findAudioDevice, getObsSourceIcon } from '@/helper/ObsAudioHelper'

export default {
  name: 'DashboardObsScenesCard',
  components: { ObsAudioControl },
  props: {
    connection: { type: String, default: 'default' },
  },
  data() {
    return {
      // Per-source audio accordions, collapsed by default.
      audioOpen: [] as string[],
      // Open scene panels. The live scene opens automatically.
      openScenes: [] as string[],
      // Scene that was clicked and is waiting for OBS to confirm the switch.
      switchingKey: '',
      switchingTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    }
  },
  beforeUnmount() {
    if (this.switchingTimer) clearTimeout(this.switchingTimer)
  },
  watch: {
    // When the live scene changes, the new one opens and the old one closes
    // (manual open/close state of other scenes is kept).
    activeSceneKeys: {
      immediate: true,
      handler(next: string[], previous: string[] = []) {
        if (next.length === previous.length && next.every(key => previous.includes(key))) return

        const open = this.openScenes.filter(key => !previous.includes(key) || next.includes(key))
        for (const key of next) if (!open.includes(key)) open.push(key)
        this.openScenes = open

        if (this.switchingKey && next.includes(this.switchingKey)) this.clearSwitching()
      },
    },
  },
  computed: {
    activeSceneKeys(): string[] {
      return this.scenes.filter((scene: any) => this.isActive(scene)).map((scene: any) => this.sceneKey(scene))
    },
    ...mapState(useAppStore, ['getObsSceneData', 'getObsSceneDataByConnection', 'getObsAudioData', 'getObsAudioDataByConnection']),
    audioData(): Record<string, any> {
      return (this.getObsAudioDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsAudioData : {})
        ?? {}
    },
    rawScenes(): any[] {
      return (this.getObsSceneDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsSceneData : [])
        ?? []
    },
    scenes(): any[] {
      return this.canvasGroups.flatMap(group => group.scenes)
    },
    // Scene data is either a flat scene list or a list of canvases, each with
    // its own `scenes`. Canvases also have a `name`, so detect them by their
    // scene list instead of by name.
    canvasGroups(): Array<{ key: string; name: string; scenes: any[] }> {
      if (!Array.isArray(this.rawScenes)) return []

      const isCanvas = (entry: any) => Array.isArray(entry?.scenes ?? entry?.sceneList)
      if (!this.rawScenes.some(isCanvas)) {
        const scenes = this.rawScenes.filter((entry: any) => entry && (entry.sceneName || entry.name || entry.sceneUuid))
        return scenes.length ? [{ key: 'default', name: '', scenes }] : []
      }

      return this.rawScenes
        .filter(isCanvas)
        .map((canvas: any, index: number) => ({
          key: String(canvas?.uuid ?? canvas?.canvasUuid ?? canvas?.name ?? index),
          name: String(canvas?.name ?? canvas?.canvasName ?? ''),
          scenes: (canvas.scenes ?? canvas.sceneList).map((scene: any) => ({
            ...scene,
            __canvasUuid: canvas?.uuid ?? canvas?.canvasUuid,
          })),
        }))
        .filter((group: any) => group.scenes.length > 0)
    },
  },
  methods: {
    // Backend flag (shared by all panels, incl. switches from OBS/cloud) or
    // the local click until the backend confirms.
    isSwitching(scene: any) {
      if (scene?.switching === true) return true
      return !this.isActive(scene) && this.switchingKey === this.sceneKey(scene)
    },
    clearSwitching() {
      this.switchingKey = ''
      if (this.switchingTimer) clearTimeout(this.switchingTimer)
      this.switchingTimer = undefined
    },
    toggleAudio(key: string) {
      this.audioOpen = this.audioOpen.includes(key)
        ? this.audioOpen.filter(entry => entry !== key)
        : [...this.audioOpen, key]
    },
    sceneSources(scene: any): Array<{ key: string; name: string; depth: number; item: any; device: any }> {
      const result: Array<{ key: string; name: string; depth: number; item: any; device: any }> = []
      const visit = (item: any, depth: number, parentKey: string) => {
        if (!item) return
        const id = String(item.sceneItemId ?? item.id ?? item.sourceUuid ?? item.uuid ?? item.name ?? result.length)
        const key = `${parentKey}/${id}`
        result.push({
          key,
          name: String(item.name ?? item.sourceName ?? item.inputName ?? id),
          depth,
          item,
          device: findAudioDevice(this.audioData, item),
        })
        if (Array.isArray(item.children)) item.children.forEach((child: any) => visit(child, depth + 1, key))
      }
      const items = scene?.items ?? scene?.sources ?? scene?.sceneItems
      if (Array.isArray(items)) items.forEach((item: any) => visit(item, 0, this.sceneKey(scene)))
      return result
    },
    sourceIcon(source: any) {
      return getObsSourceIcon(source)
    },
    isSourceEnabled(source: any) {
      return Boolean(source?.sceneItemEnabled ?? source?.enabled ?? false)
    },
    setSourceEnabled(source: any, scene: any, enabled: boolean) {
      const sceneItemId = Number(source?.sceneItemId ?? source?.id)
      if (!Number.isFinite(sceneItemId)) return

      const data: Record<string, any> = { sceneItemId, sceneItemEnabled: enabled }
      // Sources inside groups/nested scenes belong to their parent scene.
      const sceneUuid = String(source?.parentSceneUuid ?? scene?.sceneUuid ?? scene?.uuid ?? '')
      const sceneName = String(source?.parentSceneName ?? scene?.sceneName ?? scene?.name ?? '')
      if (sceneUuid) data.sceneUuid = sceneUuid
      else if (sceneName) data.sceneName = sceneName
      const canvasUuid = String(source?.canvasUuid ?? scene?.__canvasUuid ?? '')
      if (canvasUuid && canvasUuid !== 'default') data.canvasUuid = canvasUuid

      // Optimistic, the next OBS scene update confirms it.
      source.sceneItemEnabled = enabled
      source.enabled = enabled

      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method: 'SetSceneItemEnabled',
        data,
      })
    },
    sceneName(scene: any) {
      return String(scene?.sceneName ?? scene?.name ?? scene?.sceneUuid ?? scene?.uuid ?? 'Scene')
    },
    sceneKey(scene: any) {
      return String(scene?.sceneUuid ?? scene?.uuid ?? `${scene?.__canvasUuid ?? ''}:${this.sceneName(scene)}`)
    },
    isActive(scene: any) {
      return Boolean(scene?.active ?? scene?.isActive ?? scene?.current ?? scene?.isProgramScene)
    },
    switchScene(scene: any) {
      // Show the switch immediately; cleared once OBS reports the new live
      // scene (or after a timeout if the switch failed).
      this.clearSwitching()
      this.switchingKey = this.sceneKey(scene)
      this.switchingTimer = setTimeout(() => this.clearSwitching(), 10_000)

      const data: Record<string, any> = {}
      const sceneUuid = String(scene?.sceneUuid ?? scene?.uuid ?? '')
      if (sceneUuid) data.sceneUuid = sceneUuid
      else data.sceneName = this.sceneName(scene)
      if (scene?.__canvasUuid) data.canvasUuid = scene.__canvasUuid

      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method: 'SetCurrentProgramScene',
        data,
      })
    },
  },
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }

.dashboard-obs-scene {
  transition: background-color .3s ease, color .3s ease;
}
.dashboard-obs-scene__title {
  min-height: 40px !important;
  padding: 6px 12px;
}
.dashboard-obs-scene__content :deep(.v-expansion-panel-text__wrapper) {
  padding: 4px 8px 8px 12px;
}

/* Pulse while OBS performs the switch, short glow when it becomes live. */
@keyframes dashboard-obs-scene-switching {
  0%, 100% { background-color: rgba(var(--obs-switch-pulse), .06); }
  50% { background-color: rgba(var(--obs-switch-pulse), .26); }
}
@keyframes dashboard-obs-scene-activated {
  0% { box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), .7); }
  100% { box-shadow: 0 0 0 8px rgba(var(--v-theme-primary), 0); }
}
/* Glow once the transition is done (switching ends on the live scene). */
.dashboard-obs-scene--active:not(.dashboard-obs-scene--switching) { animation: dashboard-obs-scene-activated .8s ease-out; }
/* Pulse only the title; on the (primary filled) live scene use a light tint. */
.dashboard-obs-scene { --obs-switch-pulse: var(--v-theme-primary); }
.dashboard-obs-scene--active { --obs-switch-pulse: var(--v-theme-on-primary); }
.dashboard-obs-scene--switching .dashboard-obs-scene__title { animation: dashboard-obs-scene-switching 1s ease-in-out infinite; }

.dashboard-obs-source { display: flex; align-items: center; gap: 6px; min-width: 0; min-height: 34px; }
.dashboard-obs-source__icon { opacity: .8; flex: none; transition: opacity .2s ease; }
.dashboard-obs-source__name { transition: opacity .2s ease; }
.dashboard-obs-source__toggle { flex: none; margin-left: 10px; }
/* Disabled sources are dimmed; animate the change. */
.dashboard-obs-source--disabled .dashboard-obs-source__name,
.dashboard-obs-source--disabled .dashboard-obs-source__icon { opacity: .45; }
</style>

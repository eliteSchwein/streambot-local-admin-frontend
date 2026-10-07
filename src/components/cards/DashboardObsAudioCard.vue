<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-tune-vertical" />
        <span class="text-truncate">{{ $t('dashboard.customize.cards.obs_audio') }}</span>
      </v-toolbar-title>
      <template #append>
        <v-chip size="x-small" variant="tonal">{{ connection }}</v-chip>
      </template>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert
        v-if="audioList.length === 0"
        type="info"
        color="grey-darken-3"
        density="compact"
        :text="$t('obs.audioMixer.empty')"
      />

      <div v-else class="dashboard-obs-audio-list">
        <div
          v-for="device in audioList"
          :key="device.inputUuid"
          class="dashboard-obs-audio-row"
        >
          <div class="d-flex align-center ga-2 min-width-0">
            <v-btn
              :icon="device.muted ? 'mdi-volume-variant-off' : 'mdi-volume-source'"
              :color="device.muted ? 'error' : undefined"
              size="small"
              density="compact"
              variant="text"
              @click="toggleInputMute(device.inputUuid)"
            />
            <div class="min-width-0 flex-grow-1">
              <div class="text-body-2 text-truncate">{{ device.inputName }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ volumePercent(device) }}%
              </div>
            </div>
          </div>

          <v-slider
            hide-details
            :min="-100"
            :max="0"
            :step="volumeStep(device)"
            :disabled="device.muted"
            :model-value="volumeValue(device)"
            density="compact"
            class="dashboard-obs-audio-slider"
            @update:model-value="queueVolume(device.inputUuid, Number($event))"
            @end="flushVolume(device.inputUuid)"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

export default {
  name: 'DashboardObsAudioCard',
  props: {
    connection: { type: String, default: 'default' },
  },
  data() {
    return {
      volumeDrafts: {} as Record<string, number>,
      volumeTimers: {} as Record<string, ReturnType<typeof setTimeout>>,
    }
  },
  computed: {
    ...mapState(useAppStore, ['getObsAudioData', 'getObsAudioDataByConnection']),
    audioData(): Record<string, any> {
      return (this.getObsAudioDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsAudioData : {})
        ?? {}
    },
    audioList(): any[] {
      const values = Array.isArray(this.audioData) ? this.audioData.flat() : Object.values(this.audioData ?? {})
      return values
        .filter((device: any) => device?.inputUuid && device?.active !== false)
        .sort((a: any, b: any) => String(a?.inputName ?? '').localeCompare(String(b?.inputName ?? '')))
    },
  },
  beforeUnmount() {
    Object.values(this.volumeTimers).forEach(timer => clearTimeout(timer))
  },
  methods: {
    sendObsCommand(method: string, data: any) {
      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method,
        data,
      })
    },
    volumeStep(device: any) {
      const step = Number(device?.steps_range ?? device?.step_range ?? 1)
      return Number.isFinite(step) && step > 0 ? step : 1
    },
    volumeValue(device: any) {
      const id = String(device?.inputUuid ?? '')
      if (this.volumeDrafts[id] !== undefined) return this.volumeDrafts[id]
      return Number(device?.volume?.inputVolumeDb ?? -100)
    },
    volumePercent(device: any) {
      const mul = Number(device?.volume?.inputVolumeMul)
      if (Number.isFinite(mul)) return Math.round(mul * 100)
      return Math.round(Math.pow(10, this.volumeValue(device) / 20) * 100)
    },
    toggleInputMute(inputUuid: string) {
      this.sendObsCommand('ToggleInputMute', { inputUuid })
    },
    queueVolume(inputUuid: string, value: number) {
      const id = String(inputUuid)
      this.volumeDrafts[id] = Math.max(-100, Math.min(0, value))
      if (this.volumeTimers[id]) clearTimeout(this.volumeTimers[id])
      this.volumeTimers[id] = setTimeout(() => this.flushVolume(id), 160)
    },
    flushVolume(inputUuid: string) {
      const id = String(inputUuid)
      const value = this.volumeDrafts[id]
      if (value === undefined) return
      if (this.volumeTimers[id]) {
        clearTimeout(this.volumeTimers[id])
        delete this.volumeTimers[id]
      }
      delete this.volumeDrafts[id]
      this.sendObsCommand('SetInputVolume', { inputUuid: id, inputVolumeDb: value })
    },
  },
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }
.dashboard-obs-audio-list { display: flex; flex-direction: column; gap: 6px; }
.dashboard-obs-audio-row { padding: 7px 8px 4px; border-radius: 8px; background: rgba(var(--v-theme-grey-darken-4), .72); }
.dashboard-obs-audio-slider { margin-top: -2px; }
</style>

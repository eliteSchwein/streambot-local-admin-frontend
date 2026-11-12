<template>
  <div class="obs-audio-control">
    <template v-if="showName">
      <div class="font-weight-medium text-truncate">{{ device.inputName }}</div>
      <div class="text-caption text-medium-emphasis text-truncate">
        {{ device.inputKind || device.inputUuid }}
      </div>
    </template>

    <div class="d-flex align-center ga-1">
      <v-btn
        density="compact"
        elevation="0"
        variant="text"
        :color="device.muted ? 'red' : undefined"
        :icon="device.muted ? 'mdi-volume-variant-off' : 'mdi-volume-source'"
        @click.stop="toggleMute"
      />
      <v-btn
        density="compact"
        elevation="0"
        variant="text"
        icon="mdi-minus"
        :disabled="device.muted"
        @click.stop="stepVolume(-1)"
      />
      <v-slider
        hide-details
        :min="-100"
        :max="0"
        :step="volumeStep"
        :disabled="device.muted"
        :model-value="volumeValue"
        density="compact"
        class="flex-grow-1"
        @update:model-value="queueVolume(Number($event))"
        @end="flushVolume"
      />
      <v-btn
        density="compact"
        elevation="0"
        variant="text"
        icon="mdi-plus"
        :disabled="device.muted"
        @click.stop="stepVolume(1)"
      />
      <span class="text-caption text-medium-emphasis obs-audio-control__percent">
        {{ volumePercent }}%
      </span>
    </div>

    <div class="d-flex align-center ga-1">
      <span class="text-caption text-medium-emphasis obs-audio-control__label">
        {{ $t('obs.audioMixer.balance') }}
      </span>
      <v-slider
        hide-details
        :min="0"
        :max="1"
        :step="0.01"
        :model-value="balanceValue"
        density="compact"
        class="flex-grow-1"
        @update:model-value="queueBalance(Number($event))"
        @end="flushBalance"
      />
      <span class="text-caption text-medium-emphasis obs-audio-control__percent">
        {{ Math.round(balanceValue * 100) }}%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { getWebsocketClient } from '@/plugins/websocketInstance'

export default {
  name: 'ObsAudioControl',

  props: {
    device: { type: Object, required: true },
    connection: { type: String, default: 'default' },
    showName: { type: Boolean, default: false },
  },

  data() {
    return {
      volumeDraft: undefined as number | undefined,
      volumeTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      balanceDraft: undefined as number | undefined,
      balanceTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    }
  },

  computed: {
    inputUuid(): string {
      return String((this.device as any)?.inputUuid ?? '')
    },

    volumeStep(): number {
      const device: any = this.device
      const step = Number(device?.steps_range ?? device?.step_range ?? 1)
      return Number.isFinite(step) && step > 0 ? step : 1
    },

    volumeValue(): number {
      if (this.volumeDraft !== undefined) return this.volumeDraft
      return Number((this.device as any)?.volume?.inputVolumeDb ?? -100)
    },

    volumePercent(): number {
      const mul = Number((this.device as any)?.volume?.inputVolumeMul)
      if (this.volumeDraft === undefined && Number.isFinite(mul)) return Math.round(mul * 100)
      return Math.round(Math.pow(10, this.volumeValue / 20) * 100)
    },

    balanceValue(): number {
      if (this.balanceDraft !== undefined) return this.balanceDraft
      const balance = Number((this.device as any)?.balance ?? 0.5)
      return Number.isFinite(balance) ? Math.max(0, Math.min(1, balance)) : 0.5
    },
  },

  beforeUnmount() {
    if (this.volumeTimer) clearTimeout(this.volumeTimer)
    if (this.balanceTimer) clearTimeout(this.balanceTimer)
  },

  methods: {
    send(method: string, data: any) {
      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method,
        data,
      })
    },

    toggleMute() {
      this.send('ToggleInputMute', { inputUuid: this.inputUuid })
    },

    stepVolume(direction: number) {
      this.volumeDraft = Math.max(-100, Math.min(0, this.volumeValue + this.volumeStep * direction))
      this.flushVolume()
    },

    queueVolume(value: number) {
      this.volumeDraft = Math.max(-100, Math.min(0, value))
      if (this.volumeTimer) clearTimeout(this.volumeTimer)
      this.volumeTimer = setTimeout(() => this.flushVolume(), 200)
    },

    flushVolume() {
      if (this.volumeTimer) {
        clearTimeout(this.volumeTimer)
        this.volumeTimer = undefined
      }
      if (this.volumeDraft === undefined) return

      const value = this.volumeDraft
      this.volumeDraft = undefined
      this.send('SetInputVolume', { inputUuid: this.inputUuid, inputVolumeDb: value })
    },

    queueBalance(value: number) {
      this.balanceDraft = Math.max(0, Math.min(1, value))
      if (this.balanceTimer) clearTimeout(this.balanceTimer)
      this.balanceTimer = setTimeout(() => this.flushBalance(), 200)
    },

    flushBalance() {
      if (this.balanceTimer) {
        clearTimeout(this.balanceTimer)
        this.balanceTimer = undefined
      }
      if (this.balanceDraft === undefined) return

      const value = this.balanceDraft
      this.balanceDraft = undefined
      this.send('SetInputAudioBalance', { inputUuid: this.inputUuid, inputAudioBalance: value })
    },
  },
}
</script>

<style scoped>
.obs-audio-control {
  min-width: 0;
}

.obs-audio-control__percent {
  min-width: 40px;
  text-align: right;
}

.obs-audio-control__label {
  min-width: 64px;
  padding-left: 4px;
}
</style>

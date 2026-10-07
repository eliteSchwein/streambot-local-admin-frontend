<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-waveform" />
        {{ $t('dashboard.customize.cards.bot_audio_channels') }}
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert v-if="channels.length === 0" type="info" color="grey-darken-3" density="compact">
        {{ $t('dashboard.audio.noBotChannels') }}
      </v-alert>

      <div v-else class="dashboard-audio-list">
        <div v-for="channel in channels" :key="channel.key" class="dashboard-audio-row">
          <div class="d-flex align-center ga-2 min-width-0">
            <v-icon :icon="channel.icon" size="20" class="flex-shrink-0" />
            <div class="text-body-2 font-weight-medium text-capitalize flex-grow-1">{{ channel.label }}</div>
            <span class="text-caption text-medium-emphasis">{{ Math.round(volume(channel) * 100) }}%</span>
            <v-btn
              :icon="channel.data?.muted || volume(channel) === 0 ? 'mdi-volume-variant-off' : 'mdi-volume-high'"
              :color="channel.data?.muted || volume(channel) === 0 ? 'error' : undefined"
              variant="text"
              size="x-small"
              @click="toggleMute(channel)"
            />
          </div>
          <v-slider
            :model-value="volume(channel)"
            :min="Number(channel.data?.min_range ?? 0)"
            :max="Number(channel.data?.max_range ?? 1)"
            :step="Number(channel.data?.steps_range ?? 0.01)"
            density="compact"
            hide-details
            @update:model-value="setDraft(channel.key, Number($event))"
            @end="commit(channel.key)"
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

const CHANNELS = [
  { key: 'tts', label: 'TTS', icon: 'mdi-account-voice' },
  { key: 'music', label: 'Music', icon: 'mdi-music' },
  { key: 'alert', label: 'Alert', icon: 'mdi-bell-ring-outline' },
]

export default {
  name: 'DashboardBotAudioChannelsCard',
  data() { return { drafts: {} as Record<string, number>, lastNonZero: {} as Record<string, number> } },
  computed: {
    ...mapState(useAppStore, ['getAudioData']),
    channels(): any[] {
      const data: any = this.getAudioData ?? {}
      return CHANNELS
        .map(channel => ({ ...channel, data: data[channel.key] }))
        .filter(channel => channel.data && typeof channel.data === 'object')
    },
  },
  methods: {
    volume(channel: any): number {
      if (this.drafts[channel.key] !== undefined) return this.drafts[channel.key]
      const value = Number(channel.data?.current_volume ?? channel.data?.default_volume ?? 0)
      return Number.isFinite(value) ? value : 0
    },
    setDraft(key: string, value: number) { this.drafts[key] = value },
    commit(key: string) {
      const value = this.drafts[key]
      if (value === undefined) return
      delete this.drafts[key]
      if (value > 0) this.lastNonZero[key] = value
      getWebsocketClient()?.send('set_volume', { interface: key, volume: value })
    },
    toggleMute(channel: any) {
      const current = this.volume(channel)
      if (current > 0) {
        this.lastNonZero[channel.key] = current
        getWebsocketClient()?.send('set_volume', { interface: channel.key, volume: 0 })
      } else {
        const restore = this.lastNonZero[channel.key]
          ?? Number(channel.data?.default_volume ?? channel.data?.current_volume ?? 0.2)
        getWebsocketClient()?.send('set_volume', { interface: channel.key, volume: restore > 0 ? restore : 0.2 })
      }
    },
  },
}
</script>

<style scoped>
.dashboard-audio-list { display:flex; flex-direction:column; gap:6px; }
.dashboard-audio-row { padding:8px 10px 4px; border-radius:8px; background:rgba(var(--v-theme-grey-darken-4),.72); }
.min-width-0 { min-width:0; }
</style>

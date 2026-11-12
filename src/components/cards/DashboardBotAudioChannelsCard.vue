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
            <span v-if="!isPerLink(channel)" class="text-caption text-medium-emphasis">{{ Math.round(volume(channel) * 100) }}%</span>
            <v-btn
              :icon="isMuted(channel) ? 'mdi-volume-variant-off' : 'mdi-volume-high'"
              :color="isMuted(channel) ? 'error' : undefined"
              variant="text"
              size="x-small"
              @click="toggleMute(channel)"
            />
          </div>

          <v-switch
            v-if="isPipewireSink(channel)"
            :model-value="isPerLink(channel)"
            :label="$t('audio.perLink.toggle')"
            color="primary"
            density="compact"
            hide-details
            class="dashboard-audio-per-link"
            @update:model-value="setPerLink(channel.key, Boolean($event))"
          />

          <!-- Per-link control: one slider per linked output. -->
          <template v-if="isPerLink(channel)">
            <div
              v-for="output in linkedOutputs(channel)"
              :key="output"
              class="dashboard-audio-link"
              :class="{ 'dashboard-audio-link--offline': !isOutputConnected(output) }"
              :title="output"
            >
              <div class="d-flex align-center ga-2 min-width-0">
                <v-icon icon="mdi-arrow-right-thin" size="16" class="flex-shrink-0 text-medium-emphasis" />
                <!-- min-width 0 lets long names truncate instead of pushing the button out. -->
                <span class="text-caption text-truncate flex-grow-1 min-width-0">{{ outputLabel(output) }}</span>
                <v-chip v-if="!isOutputConnected(output)" size="x-small" variant="tonal" class="flex-shrink-0">{{ $t('dashboard.audio.notConnected') }}</v-chip>
                <v-btn
                  v-if="!isOutputConnected(output)"
                  icon="mdi-link-variant-remove"
                  size="x-small"
                  variant="text"
                  density="comfortable"
                  color="error"
                  class="flex-shrink-0"
                  :title="$t('dashboard.audio.removeLink')"
                  @click="removeLink(channel.key, output)"
                />
                <span class="text-caption text-medium-emphasis flex-shrink-0">{{ Math.round(linkVolume(channel, output) * 100) }}%</span>
              </div>
              <v-slider
                :model-value="linkVolume(channel, output)"
                :min="Number(channel.data?.min_range ?? 0)"
                :max="Number(channel.data?.max_range ?? 1)"
                :step="Number(channel.data?.steps_range ?? 0.01)"
                :disabled="isMuted(channel)"
                density="compact"
                hide-details
                @update:model-value="setLinkDraft(channel.key, output, Number($event))"
                @end="commitLink(channel.key, output)"
              />
            </div>
          </template>

          <v-slider
            v-else
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
import { prettySinkName } from '@/helper/AudioOutputHelper'

const CHANNELS = [
  { key: 'tts', label: 'TTS', icon: 'mdi-account-voice' },
  { key: 'music', label: 'Music', icon: 'mdi-music' },
  { key: 'alert', label: 'Alert', icon: 'mdi-bell-ring-outline' },
]

export default {
  name: 'DashboardBotAudioChannelsCard',
  data() { return { drafts: {} as Record<string, number>, linkDrafts: {} as Record<string, number> } },
  computed: {
    ...mapState(useAppStore, ['getAudioData', 'getAudioOutputs']),
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
    isMuted(channel: any): boolean {
      return channel.data?.muted === true || this.volume(channel) === 0
    },
    isPerLink(channel: any): boolean {
      return channel.data?.per_link_control === true
    },
    isPipewireSink(channel: any): boolean {
      const value = channel.data?.pipewire_sink
      return value === true || value === 'true' || value === 1 || value === '1'
    },
    setPerLink(key: string, enabled: boolean) {
      getWebsocketClient()?.send('set_per_link_control', { interface: key, enabled })
    },
    // Same order as the output list (audio page columns); disconnected last.
    linkedOutputs(channel: any): string[] {
      const outputs = channel.data?.linked_outputs
      if (!Array.isArray(outputs)) return []
      const order = this.outputList().map((entry: any) => String(entry?.name ?? ''))
      const rank = (name: string) => { const index = order.indexOf(name); return index < 0 ? Number.MAX_SAFE_INTEGER : index }
      return outputs.map(String).sort((a: string, b: string) => rank(a) - rank(b))
    },
    outputList(): any[] {
      const outputs: any = this.getAudioOutputs
      return Array.isArray(outputs) ? outputs : Object.values(outputs ?? {})
    },
    findOutput(outputName: string): any {
      return this.outputList().find((entry: any) => String(entry?.name ?? '') === outputName)
    },
    isOutputConnected(outputName: string): boolean {
      return Boolean(this.findOutput(outputName))
    },
    outputLabel(outputName: string): string {
      const output = this.findOutput(outputName)
      if (!output) return prettySinkName(outputName)
      return String(output.virtual_audio_cable_name ?? output.description ?? output.display_name ?? outputName)
    },
    linkVolume(channel: any, outputName: string): number {
      const draft = this.linkDrafts[`${channel.key}\u0000${outputName}`]
      if (draft !== undefined) return draft
      const value = Number(channel.data?.link_volumes?.[outputName])
      return Number.isFinite(value) ? value : this.volume(channel)
    },
    setLinkDraft(key: string, outputName: string, value: number) {
      this.linkDrafts[`${key}\u0000${outputName}`] = value
    },
    commitLink(key: string, outputName: string) {
      const draftKey = `${key}\u0000${outputName}`
      const value = this.linkDrafts[draftKey]
      if (value === undefined) return
      delete this.linkDrafts[draftKey]
      getWebsocketClient()?.send('set_link_volume', { interface: key, output: outputName, volume: value })
    },
    removeLink(key: string, outputName: string) {
      getWebsocketClient()?.send('link_sink', { interface: key, output: outputName, linked: false })
    },
    setDraft(key: string, value: number) { this.drafts[key] = value },
    commit(key: string) {
      const value = this.drafts[key]
      if (value === undefined) return
      delete this.drafts[key]
      getWebsocketClient()?.send('set_volume', { interface: key, volume: value })
    },
    toggleMute(channel: any) {
      if (!this.isMuted(channel)) {
        getWebsocketClient()?.send('set_volume', { interface: channel.key, volume: 0 })
        return
      }

      // Unmute with the retained volume; the backend then also restores the
      // individual link volumes (per link control).
      const restore = Number(channel.data?.current_volume ?? channel.data?.default_volume ?? 0.2)
      getWebsocketClient()?.send('set_volume', { interface: channel.key, volume: restore > 0 ? restore : 0.2 })
    },
  },
}
</script>

<style scoped>
.dashboard-audio-list { display:flex; flex-direction:column; gap:6px; }
.dashboard-audio-row { padding:8px 10px 4px; border-radius:8px; background:rgba(var(--v-theme-grey-darken-4),.72); }
.min-width-0 { min-width:0; }
.dashboard-audio-link { padding-left: 6px; }
.dashboard-audio-per-link { margin-left: 8px; }
.dashboard-audio-per-link :deep(.v-label) { font-size: .75rem; }
.dashboard-audio-link--offline { opacity: .55; }
</style>

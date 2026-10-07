<template>
  <v-card variant="flat" class="dashboard-audio-card">
    <v-card-title class="d-flex align-center ga-2 py-2 px-3">
      <v-icon icon="mdi-access-point-network" size="20" />
      <span class="text-subtitle-1">{{ $t('dashboard.customize.cards.virtual_audio_channels') }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-2">
      <v-alert v-if="cables.length === 0" type="info" density="compact" variant="tonal">{{ $t('dashboard.audio.noVirtualChannels') }}</v-alert>
      <div v-for="cable in cables" :key="cable.id" class="cable-block">
        <div class="d-flex align-center ga-2 mb-2">
          <v-icon icon="mdi-access-point-network" size="18" />
          <span class="text-body-2 font-weight-medium">{{ cable.name || cable.id }}</span>
        </div>
        <div class="channel-grid">
          <v-checkbox-btn
            v-for="channel in pipewireChannels"
            :key="`${cable.id}:${channel}`"
            :model-value="hasChannel(cable, channel)"
            density="compact"
            :label="channel"
            @update:model-value="toggleChannel(cable, channel, Boolean($event))"
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
  computed: {
    ...mapState(useAppStore, ['getSettings', 'getAudioData']),
    cables(): any[] {
      const raw: any = (this.getSettings as any)?.virtual_audio_cables ?? []
      return Array.isArray(raw) ? raw : Object.entries(raw).map(([id, value]: any) => ({ id, ...(value && typeof value === 'object' ? value : {}) }))
    },
    pipewireChannels(): string[] {
      return Object.entries((this.getAudioData as any) ?? {})
        .filter(([, value]: any) => value?.pipewire_sink === true || value?.pipewire_sink === 'true')
        .map(([name]) => name)
        .sort((a, b) => a.localeCompare(b))
    },
  },
  methods: {
    hasChannel(cable: any, channel: string) { return (Array.isArray(cable?.channels) ? cable.channels.map(String) : []).includes(channel) },
    async toggleChannel(cable: any, channel: string, enabled: boolean) {
      const settings: any = JSON.parse(JSON.stringify(this.getSettings ?? {}))
      const cables = Array.isArray(settings.virtual_audio_cables) ? settings.virtual_audio_cables : []
      const target = cables.find((entry: any) => String(entry?.id ?? '') === String(cable?.id ?? ''))
      if (!target) return
      const channels = new Set((Array.isArray(target.channels) ? target.channels : []).map(String))
      enabled ? channels.add(channel) : channels.delete(channel)
      target.channels = Array.from(channels)
      const client: any = getWebsocketClient()
      if (!client?.request) return
      const response = await client.request('settings_save', settings, 20_000)
      const params = response?.params ?? response
      const saved = params?.result_settings_save ?? params?.settings ?? params?.data ?? params
      useAppStore().setSettings(saved && typeof saved === 'object' ? saved : settings)
    },
  },
}
</script>

<style scoped>
.dashboard-audio-card { background: transparent; }
.cable-block { padding: 6px 4px 10px; }
.cable-block + .cable-block { border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding-top: 10px; }
.channel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2px 10px; }
</style>

<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-tune-variant" />
        {{ $t('dashboard.customize.cards.audio_presets') }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text class="pt-3">
      <v-alert v-if="presets.length === 0" density="compact" type="info" color="grey-darken-3" :text="$t('dashboard.audio.noPresets')" />
      <div v-else class="preset-list">
        <div v-for="preset in presets" :key="preset.name" class="preset-row">
          <div class="min-width-0">
            <div class="text-body-2 font-weight-medium text-truncate">{{ preset.name }}</div>
            <div v-if="presetSummary(preset)" class="text-caption text-medium-emphasis text-truncate">{{ presetSummary(preset) }}</div>
          </div>
          <v-btn icon="mdi-play" size="small" variant="tonal" color="primary" :title="$t('dashboard.audio.applyPreset')" @click="applyPreset(preset.name)" />
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
  name: 'DashboardAudioPresetsCard',
  computed: {
    ...mapState(useAppStore, ['getAudioPresets']),
    presets(): any[] {
      return Object.values(this.getAudioPresets ?? {}).filter((p:any)=>p?.name).sort((a:any,b:any)=>String(a.name).localeCompare(String(b.name)))
    },
  },
  methods: {
    applyPreset(name: string) { if (name) getWebsocketClient()?.send('audio_preset_apply', { name }) },
    presetSummary(preset: any) {
      const parts:string[]=[]
      const volumes = preset?.volumes && typeof preset.volumes === 'object' ? Object.keys(preset.volumes).length : 0
      const outputs = preset?.outputs && typeof preset.outputs === 'object' ? Object.keys(preset.outputs).length : 0
      if (volumes) parts.push(this.$t('dashboard.audio.presetVolumes', { count: volumes }) as string)
      if (outputs) parts.push(this.$t('dashboard.audio.presetMappings', { count: outputs }) as string)
      return parts.join(' · ')
    },
  },
}
</script>

<style scoped>
.preset-list { display:grid; max-height:360px; overflow-y:auto; }
.preset-row { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:52px; padding:7px 6px 7px 10px; border-bottom:thin solid rgba(var(--v-border-color),var(--v-border-opacity)); }
.preset-row:last-child { border-bottom:0; }
.min-width-0 { min-width:0; }
</style>

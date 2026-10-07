<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-speaker-multiple" />
        {{ $t('dashboard.customize.cards.audio_outputs') }}
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert v-if="outputs.length === 0" type="info" color="grey-darken-3" density="compact">
        {{ $t('dashboard.audio.noOutputs') }}
      </v-alert>
      <div v-else class="dashboard-audio-list">
        <div v-for="output in outputs" :key="outputId(output)" class="dashboard-audio-row">
          <div class="d-flex align-center ga-2 min-width-0">
            <v-icon icon="mdi-speaker" size="20" class="flex-shrink-0" />
            <div class="text-body-2 font-weight-medium text-truncate flex-grow-1" :title="label(output)">{{ label(output) }}</div>
            <span class="text-caption text-medium-emphasis">{{ Math.round(volume(output) * 100) }}%</span>
            <v-btn
              :icon="isMuted(output) ? 'mdi-volume-variant-off' : 'mdi-volume-high'"
              :color="isMuted(output) ? 'error' : undefined"
              size="x-small"
              variant="text"
              @click="setMute(output, !isMuted(output))"
            />
          </div>
          <v-slider
            :model-value="volume(output)"
            min="0"
            max="1"
            step="0.01"
            density="compact"
            hide-details
            :disabled="isMuted(output)"
            @update:model-value="setDraft(output, Number($event))"
            @end="commitVolume(output)"
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
  data() { return { drafts: {} as Record<string, number> } },
  computed: {
    ...mapState(useAppStore, ['getAudioOutputs', 'getAudioOutput']),
    outputs(): any[] {
      const payload: any = this.getAudioOutputs ?? this.getAudioOutput ?? {}
      const raw = Array.isArray(payload) ? payload : Array.isArray(payload?.outputs) ? payload.outputs : Array.isArray(payload?.sinks) ? payload.sinks : Object.entries(payload ?? {}).map(([id, value]: any) => ({ id, ...(value && typeof value === 'object' ? value : { name: String(value) }) }))
      return raw.filter((item: any) => this.outputId(item))
    },
  },
  methods: {
    outputId(output: any) { return String(output?.name ?? output?.node_name ?? output?.nodeName ?? output?.id ?? output?.index ?? '') },
    label(output: any) { return String(output?.label ?? output?.description ?? output?.name ?? output?.node_name ?? output?.id ?? '') },
    volume(output: any) { const key=this.outputId(output); if(this.drafts[key]!==undefined)return this.drafts[key]; const value=Number(output?.volume??0); return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0 },
    isMuted(output:any){ return output?.muted===true || this.volume(output)===0 },
    setDraft(output:any,value:number){ this.drafts[this.outputId(output)]=Math.max(0,Math.min(1,value)) },
    commitVolume(output:any){ const key=this.outputId(output); const value=this.drafts[key]; if(!key||value===undefined)return; delete this.drafts[key]; getWebsocketClient()?.send('set_audio_output_volume',{output:key,volume:value}) },
    setMute(output:any,muted:boolean){ const key=this.outputId(output); if(key)getWebsocketClient()?.send('set_audio_output_mute',{output:key,muted}) },
  },
}
</script>
<style scoped>
.dashboard-audio-list { display:flex; flex-direction:column; gap:6px; }
.dashboard-audio-row { padding:8px 10px 4px; border-radius:8px; background:rgba(var(--v-theme-grey-darken-4),.72); }
.min-width-0 { min-width:0; }
</style>

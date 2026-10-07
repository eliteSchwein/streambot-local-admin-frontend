<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2"><v-icon icon="mdi-filmstrip" />{{ $t('rotatingScenes.headerTitle') }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text class="pa-2">
      <v-alert v-if="items.length === 0" type="info" color="grey-darken-3" density="compact">{{ $t('rotatingScenes.noScenesFound') }}</v-alert>
      <div v-else class="d-flex flex-column ga-2">
        <div v-for="item in items" :key="item.name" class="dashboard-rs-row">
          <div class="min-width-0 flex-grow-1">
            <div class="text-body-2 text-truncate">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('components.rotatingScene.sceneCount', { count: sceneCount(item.data) }) }}</div>
          </div>
          <v-btn v-if="!isRunning(item)" icon="mdi-play" size="small" variant="tonal" color="primary" @click="start(item.name)" />
          <v-btn v-else icon="mdi-stop" size="small" variant="tonal" color="error" @click="stop" />
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
  name:'DashboardRotatingScenesCard',
  computed:{
    ...mapState(useAppStore,['getRotatingScenes']),
    items(): any[] { return Object.entries(this.getRotatingScenes ?? {}).map(([name,data])=>({name,data})).sort((a,b)=>a.name.localeCompare(b.name)) },
  },
  methods:{
    sceneCount(data:any){ const scenes=data?.scenes ?? data?.items ?? data?.rotation ?? []; return Array.isArray(scenes)?scenes.length:0 },
    isRunning(item:any){ return Boolean(item.data?.active ?? item.data?.running ?? item.data?.isRunning) },
    start(name:string){ getWebsocketClient()?.send('rotating_scene_start',{name}) },
    stop(){ getWebsocketClient()?.send('rotating_scene_stop',{}) },
  },
}
</script>
<style scoped>.dashboard-rs-row{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:rgba(var(--v-theme-grey-darken-4),.72)}.min-width-0{min-width:0}</style>

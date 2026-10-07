<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2"><v-icon icon="mdi-video-wireless-outline" />{{ $t('dashboard.customize.cards.yolobox') }}</v-toolbar-title>
      <template #append><v-chip size="x-small" :color="connected ? 'success' : undefined" variant="tonal">{{ connected ? 'Connected' : 'Offline' }}</v-chip></template>
    </v-toolbar>
    <v-card-text class="pa-2">
      <v-alert v-if="sources.length === 0" type="info" color="grey-darken-3" density="compact">No YoloBox sources.</v-alert>
      <div v-else class="dashboard-yolo-grid">
        <v-card v-for="source in sources.slice(0,6)" :key="source.id" class="cursor-pointer" variant="tonal" @click="toggleSource(source)">
          <div class="position-relative dashboard-yolo-preview">
            <YoloboxPreview v-if="source.previewUrl || source.url" :src="source.previewUrl || source.url" cover />
            <div v-else class="d-flex align-center justify-center h-100"><v-icon icon="mdi-video-outline" /></div>
            <v-icon v-if="source.isSelected" class="dashboard-yolo-check" icon="mdi-check-circle" color="primary" />
          </div>
          <v-card-text class="pa-2 text-caption text-truncate">{{ source.directorName ?? source.name ?? source.id }}</v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import YoloboxPreview from '@/components/yolobox/YoloboxPreview.vue'
export default {
  name:'DashboardYoloboxCard', components:{YoloboxPreview},
  computed:{
    ...mapState(useAppStore,['getYoloboxData','getIntegrations']),
    sources():any[]{ return Array.isArray(this.getYoloboxData?.DirectorList)?this.getYoloboxData.DirectorList:[] },
    connected():boolean{ return Boolean(this.getIntegrations?.yolobox?.connected ?? this.sources.length) },
  },
  methods:{ toggleSource(source:any){ getWebsocketClient()?.send('execute_yolobox',{data:{id:source.id,isSelected:true},orderID:'order_director_change'}) } },
}
</script>
<style scoped>.dashboard-yolo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.dashboard-yolo-preview{height:92px;overflow:hidden}.dashboard-yolo-check{position:absolute;right:6px;top:6px}</style>

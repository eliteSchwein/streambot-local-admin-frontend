<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2"><v-icon icon="mdi-video-outline" />{{ $t('dashboard.customize.cards.obs') }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text class="pa-2">
      <v-select v-if="connectionNames.length > 1" v-model="connection" :items="connectionNames" density="compact" variant="outlined" hide-details class="mb-2" prepend-inner-icon="mdi-connection" />
      <v-alert v-if="scenes.length === 0" type="info" color="grey-darken-3" density="compact">No OBS scenes.</v-alert>
      <div v-else class="d-flex flex-column ga-1">
        <v-btn v-for="scene in scenes.slice(0,12)" :key="sceneKey(scene)" block variant="tonal" :color="isActive(scene) ? 'primary' : undefined" class="justify-start" @click="switchScene(scene)">
          <v-icon start :icon="isActive(scene)?'mdi-radiobox-marked':'mdi-radiobox-blank'" />
          <span class="text-truncate">{{ sceneName(scene) }}</span>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
export default {
  name:'DashboardObsCard',
  data(){return{connection:'default'}},
  computed:{
    ...mapState(useAppStore,['getObsSceneData','getObsSceneDataByConnection']),
    connectionNames():string[]{ const names=Object.entries(this.getObsSceneDataByConnection??{}).filter(([,v]:any)=>Array.isArray(v)&&v.length).map(([k])=>k); if(!names.length&&Array.isArray(this.getObsSceneData)&&this.getObsSceneData.length) names.push('default'); return names.sort() },
    rawScenes():any[]{ return this.getObsSceneDataByConnection?.[this.connection] ?? (this.connection==='default'?this.getObsSceneData:[]) ?? [] },
    scenes():any[]{
      const raw=this.rawScenes
      if(!Array.isArray(raw)) return []
      const direct=raw.filter((x:any)=>x && (x.sceneName||x.name||x.uuid||x.sceneUuid))
      if(direct.length) return direct
      const out:any[]=[]
      for(const canvas of raw){ const list=canvas?.scenes ?? canvas?.sceneList ?? []; if(Array.isArray(list)) out.push(...list.map((s:any)=>({...s,__canvasUuid:canvas?.uuid??canvas?.canvasUuid}))) }
      return out
    },
  },
  watch:{connectionNames:{immediate:true,handler(names:string[]){if(names.length&&!names.includes(this.connection))this.connection=names[0]}}},
  methods:{
    sceneName(scene:any){return String(scene?.sceneName??scene?.name??scene?.uuid??scene?.sceneUuid??'Scene')},
    sceneKey(scene:any){return String(scene?.sceneUuid??scene?.uuid??this.sceneName(scene))},
    isActive(scene:any){return Boolean(scene?.active??scene?.isActive??scene?.current??scene?.isProgramScene)},
    switchScene(scene:any){ const data:any={}; const uuid=String(scene?.sceneUuid??scene?.uuid??''); const name=this.sceneName(scene); if(uuid)data.sceneUuid=uuid; else data.sceneName=name; if(scene?.__canvasUuid)data.canvasUuid=scene.__canvasUuid; getWebsocketClient()?.send('obs_trigger_command',{connection:this.connection,obs_id:this.connection,method:'SetCurrentProgramScene',data}) },
  },
}
</script>

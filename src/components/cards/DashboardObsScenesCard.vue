<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-video-switch-outline" />
        <span class="text-truncate">{{ $t('dashboard.customize.cards.obs_scenes') }}</span>
      </v-toolbar-title>
      <template #append>
        <v-chip size="x-small" variant="tonal">{{ connection }}</v-chip>
      </template>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert
        v-if="scenes.length === 0"
        type="info"
        color="grey-darken-3"
        density="compact"
        :text="$t('obs.settings.empty')"
      />

      <div v-else class="d-flex flex-column ga-1">
        <v-btn
          v-for="scene in scenes"
          :key="sceneKey(scene)"
          block
          size="small"
          variant="tonal"
          :color="isActive(scene) ? 'primary' : undefined"
          class="justify-start dashboard-obs-scene"
          @click="switchScene(scene)"
        >
          <v-icon
            start
            :icon="isActive(scene) ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
          />
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
  name: 'DashboardObsScenesCard',
  props: {
    connection: { type: String, default: 'default' },
  },
  computed: {
    ...mapState(useAppStore, ['getObsSceneData', 'getObsSceneDataByConnection']),
    rawScenes(): any[] {
      return (this.getObsSceneDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsSceneData : [])
        ?? []
    },
    scenes(): any[] {
      if (!Array.isArray(this.rawScenes)) return []
      const direct = this.rawScenes.filter((entry: any) => entry && (entry.sceneName || entry.name || entry.sceneUuid))
      if (direct.length) return direct

      const result: any[] = []
      for (const canvas of this.rawScenes) {
        const sceneList = canvas?.scenes ?? canvas?.sceneList ?? []
        if (!Array.isArray(sceneList)) continue
        result.push(...sceneList.map((scene: any) => ({
          ...scene,
          __canvasUuid: canvas?.uuid ?? canvas?.canvasUuid,
        })))
      }
      return result
    },
  },
  methods: {
    sceneName(scene: any) {
      return String(scene?.sceneName ?? scene?.name ?? scene?.sceneUuid ?? scene?.uuid ?? 'Scene')
    },
    sceneKey(scene: any) {
      return String(scene?.sceneUuid ?? scene?.uuid ?? `${scene?.__canvasUuid ?? ''}:${this.sceneName(scene)}`)
    },
    isActive(scene: any) {
      return Boolean(scene?.active ?? scene?.isActive ?? scene?.current ?? scene?.isProgramScene)
    },
    switchScene(scene: any) {
      const data: Record<string, any> = {}
      const sceneUuid = String(scene?.sceneUuid ?? scene?.uuid ?? '')
      if (sceneUuid) data.sceneUuid = sceneUuid
      else data.sceneName = this.sceneName(scene)
      if (scene?.__canvasUuid) data.canvasUuid = scene.__canvasUuid

      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method: 'SetCurrentProgramScene',
        data,
      })
    },
  },
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }
.dashboard-obs-scene { min-width: 0; }
</style>

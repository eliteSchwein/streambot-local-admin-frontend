<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-tune-vertical" />
        <span class="text-truncate">{{ $t('dashboard.customize.cards.obs_audio') }}</span>
      </v-toolbar-title>
      <template #append>
        <v-chip size="x-small" variant="tonal">{{ connection }}</v-chip>
      </template>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert
        v-if="globalAudioDevices.length === 0"
        type="info"
        color="grey-darken-3"
        density="compact"
        :text="$t('obs.audioMixer.empty')"
      />

      <div
        v-for="(device, index) in globalAudioDevices"
        v-else
        :key="device.inputUuid"
      >
        <ObsAudioControl
          :device="device"
          :connection="connection"
          show-name
          class="px-1 py-2"
        />
        <v-divider v-if="index < globalAudioDevices.length - 1" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import ObsAudioControl from '@/components/obs/ObsAudioControl.vue'
import { getGlobalAudioDevices } from '@/helper/ObsAudioHelper'

// Global OBS audio devices only; scene sources are controlled in the scenes card.
export default {
  name: 'DashboardObsAudioCard',
  components: { ObsAudioControl },
  props: {
    connection: { type: String, default: 'default' },
  },
  computed: {
    ...mapState(useAppStore, ['getObsAudioData', 'getObsAudioDataByConnection', 'getObsSceneData', 'getObsSceneDataByConnection']),
    audioData(): Record<string, any> {
      return (this.getObsAudioDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsAudioData : {})
        ?? {}
    },
    sceneData(): any[] {
      return (this.getObsSceneDataByConnection as any)?.[this.connection]
        ?? (this.connection === 'default' ? this.getObsSceneData : [])
        ?? []
    },
    globalAudioDevices(): any[] {
      return getGlobalAudioDevices(this.audioData, this.sceneData)
    },
  },
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }
</style>

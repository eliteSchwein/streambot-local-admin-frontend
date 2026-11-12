<template>
  <v-card color="grey-darken-4 pt-2" elevation="0" rounded="0">
    <v-card-title class="d-flex align-center ga-2">
      <span>{{ $t('obs.audioMixer.title') }}</span>
      <v-chip size="small" variant="tonal">{{ globalAudioDevices.length }}</v-chip>
    </v-card-title>

    <v-card-text class="obs-audio-content">
      <v-alert
        v-if="globalAudioDevices.length === 0"
        type="info"
        variant="tonal"
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
          class="py-2"
        />
        <v-divider v-if="index < globalAudioDevices.length - 1" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import ObsAudioControl from '@/components/obs/ObsAudioControl.vue'
import { getGlobalAudioDevices } from '@/helper/ObsAudioHelper'

// Global OBS audio devices (Desktop Audio, Mic/Aux, ...). Audio sources that
// are part of a scene are controlled under the source in the scene browser.
export default {
  components: { ObsAudioControl },

  props: {
    connection: {
      type: String,
      default: 'default',
    },
    audioData: {
      type: Object,
      default: () => ({}),
    },
    scenes: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    globalAudioDevices(): any[] {
      return getGlobalAudioDevices(this.audioData, this.scenes)
    },
  },
}
</script>

<style scoped>
.obs-audio-content {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
</style>

<template>
  <div>
    <div v-if="connectionNames.length > 1" class="px-3 pt-3">
      <v-select
        v-model="selectedConnection"
        class="obs-instance-select"
        :items="connectionNames"
        label="OBS connection"
        prepend-inner-icon="mdi-connection"
        variant="outlined"
        density="comfortable"
        hide-details
      />
    </div>

  <v-row class="obs-page-layout ma-0 pa-0" density="comfortable" no-gutters>

    <v-col cols="12" lg="6" class="obs-page-panel">
      <ObsAudioMixer
        :connection="selectedConnection"
        :audio-data="selectedAudioData"
      />
    </v-col>

    <v-col cols="12" lg="6" class="obs-page-panel obs-page-panel--right">
      <ObsSceneBrowser
        :connection="selectedConnection"
        :scenes="selectedSceneData"
      />
    </v-col>
  </v-row>
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import ObsAudioMixer from '@/components/obs/ObsAudioMixer.vue'
import ObsSceneBrowser from '@/components/obs/ObsSceneBrowser.vue'

export default {
  components: {
    ObsAudioMixer,
    ObsSceneBrowser,
  },

  data() {
    return {
      selectedConnection: 'default',
    }
  },

  computed: {
    ...mapState(useAppStore, [
      'getObsSceneData',
      'getObsSceneDataByConnection',
      'getObsAudioData',
      'getObsAudioDataByConnection',
    ]),

    connectionNames(): string[] {
      const names = new Set<string>()

      Object.entries(this.getObsSceneDataByConnection ?? {}).forEach(([name, data]: [string, any]) => {
        if(Array.isArray(data) && data.length > 0) names.add(name)
      })
      Object.entries(this.getObsAudioDataByConnection ?? {}).forEach(([name, data]: [string, any]) => {
        if(data && typeof data === 'object' && Object.keys(data).length > 0) names.add(name)
      })

      if(names.size === 0 && (this.getObsSceneData?.length || Object.keys(this.getObsAudioData ?? {}).length)) {
        names.add('default')
      }

      return Array.from(names).sort((a, b) => a.localeCompare(b))
    },

    selectedAudioData(): Record<string, any> {
      return this.getObsAudioDataByConnection?.[this.selectedConnection]
        ?? (this.selectedConnection === 'default' ? this.getObsAudioData : {})
        ?? {}
    },

    selectedSceneData(): any[] {
      return this.getObsSceneDataByConnection?.[this.selectedConnection]
        ?? (this.selectedConnection === 'default' ? this.getObsSceneData : [])
        ?? []
    },
  },

  watch: {
    connectionNames: {
      immediate: true,
      handler(names: string[]) {
        if(names.length > 0 && !names.includes(this.selectedConnection)) {
          this.selectedConnection = names[0]
        }
      },
    },
  },
}
</script>

<style scoped>
.obs-page-layout {
  width: 100%;
  max-height: calc(100vh - 54px);
  overflow-y: auto;
}

.obs-page-panel {
  min-width: 0;
}

.obs-page-panel + .obs-page-panel {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.obs-instance-select {
  max-width: 280px;
}

@media (min-width: 1280px) {
  .obs-page-panel--right {
    border-top: 0;
    border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>

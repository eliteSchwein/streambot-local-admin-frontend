<template>
  <v-dialog
    :model-value="modelValue"
    max-width="860"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar color="primary" flat density="compact">
        <v-toolbar-title>
          {{ $t('audio.presets.savePreset') }}
        </v-toolbar-title>

        <v-btn
          icon="mdi-close"
          @click="$emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-card-text class="d-flex flex-column ga-4">
        <v-text-field
          v-model="nameModel"
          :label="$t('audio.presets.name')"
          prepend-inner-icon="mdi-tag-outline"
          variant="outlined"
          density="comfortable"
          autofocus
        />

        <v-card color="grey-darken-3" variant="flat">
          <v-card-title class="text-subtitle-1">
            {{ $t('audio.presets.volumes') }}
          </v-card-title>

          <v-card-text>
            <v-checkbox
              v-model="saveAllVolumesModel"
              :label="$t('audio.presets.saveAllVolumes')"
              hide-details
              density="comfortable"
            />

            <v-select
              v-if="!saveAllVolumesModel"
              v-model="volumeTracksModel"
              :items="audioInterfaceOptions"
              :label="$t('audio.presets.selectVolumeTracks')"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-card-text>
        </v-card>

        <v-card color="grey-darken-3" variant="flat">
          <v-card-title class="text-subtitle-1">
            {{ $t('audio.presets.outputLinks') }}
          </v-card-title>

          <v-card-text>
            <v-checkbox
              v-model="saveAllMappingsModel"
              :label="$t('audio.presets.saveAllMappings')"
              hide-details
              density="comfortable"
              class="mb-3"
            />

            <div
              v-if="!saveAllMappingsModel"
              class="audio-preset-mapping-table-wrap"
            >
              <table class="audio-preset-mapping-table">
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ $t('audio.interface') }}
                    </th>

                    <th
                      v-for="output in audioOutputs"
                      :key="outputKey(output)"
                      class="text-center"
                    >
                      <div class="d-flex align-center justify-center ga-1">
                        <v-icon
                          v-if="isDefaultOutput(output)"
                          icon="mdi-star-circle"
                          size="x-small"
                        />
                        <span>{{ outputLabel(output) }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="audioInterface in pipewireInterfaceOptions"
                    :key="audioInterface"
                  >
                    <td class="font-weight-medium">
                      {{ audioInterface }}
                    </td>

                    <td
                      v-for="output in audioOutputs"
                      :key="`${audioInterface}-${outputKey(output)}`"
                      class="text-center"
                    >
                      <v-checkbox-btn
                        :model-value="isMappingSelected(audioInterface, output)"
                        density="compact"
                        class="justify-center"
                        @update:model-value="setMappingSelected(
                          audioInterface,
                          output,
                          Boolean($event),
                        )"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>

        <v-alert
          v-if="!hasSelection"
          type="warning"
          variant="tonal"
          density="compact"
        >
          {{ $t('audio.presets.emptyWarning') }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          :disabled="!nameModel.trim() || !hasSelection"
          @click="confirm"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'AudioPresetSaveDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    saveAllVolumes: {
      type: Boolean,
      default: true,
    },
    volumeTracks: {
      type: Array,
      default: () => [],
    },
    saveAllMappings: {
      type: Boolean,
      default: false,
    },
    mappings: {
      type: Object,
      default: () => ({}),
    },
    audioData: {
      type: Object,
      default: () => ({}),
    },
    audioOutputs: {
      type: Array,
      default: () => [],
    },
  },

  emits: [
    'update:modelValue',
    'update:name',
    'update:saveAllVolumes',
    'update:volumeTracks',
    'update:saveAllMappings',
    'update:mappings',
    'confirm',
  ],

  computed: {
    nameModel: {
      get(): string {
        return this.name
      },
      set(value: string) {
        this.$emit('update:name', value)
      },
    },

    saveAllVolumesModel: {
      get(): boolean {
        return this.saveAllVolumes
      },
      set(value: boolean) {
        this.$emit('update:saveAllVolumes', value)
      },
    },

    volumeTracksModel: {
      get(): string[] {
        return Array.isArray(this.volumeTracks) ? this.volumeTracks : []
      },
      set(value: string[]) {
        this.$emit('update:volumeTracks', value)
      },
    },

    saveAllMappingsModel: {
      get(): boolean {
        return this.saveAllMappings
      },
      set(value: boolean) {
        this.$emit('update:saveAllMappings', value)
      },
    },

    audioInterfaceOptions(): string[] {
      return Object.keys(this.audioData ?? {}).sort((a, b) => a.localeCompare(b))
    },

    pipewireInterfaceOptions(): string[] {
      return Object.entries(this.audioData ?? {})
        .filter(([, data]: [string, any]) =>
          data?.pipewire_sink === true || data?.pipewire_sink === 'true',
        )
        .map(([name]) => name)
        .sort((a, b) => a.localeCompare(b))
    },

    hasSelection(): boolean {
      const hasVolumes =
        this.saveAllVolumesModel ||
        this.volumeTracksModel.length > 0

      const hasMappings =
        this.saveAllMappingsModel ||
        Object.values(this.mappings ?? {}).some(
          (outputs: any) => Array.isArray(outputs) && outputs.length > 0,
        )

      return hasVolumes || hasMappings
    },
  },

  methods: {
    outputIdentifier(output: any): string {
      return String(output?.name ?? output?.id ?? '')
    },

    outputKey(output: any): string {
      return this.outputIdentifier(output)
    },

    outputLabel(output: any): string {
      return String(output?.description ?? output?.name ?? output?.id ?? '')
    },

    isDefaultOutput(output: any): boolean {
      return output?.is_default === true ||
        output?.default === true ||
        output?.isDefault === true
    },

    isMappingSelected(audioInterface: string, output: any): boolean {
      const outputName = this.outputIdentifier(output)
      const current = this.mappings?.[audioInterface]

      return Array.isArray(current) && current.map(String).includes(outputName)
    },

    setMappingSelected(audioInterface: string, output: any, selected: boolean) {
      const outputName = this.outputIdentifier(output)
      if (!outputName) return

      const next = {
        ...(this.mappings ?? {}),
      }

      const current = Array.isArray(next[audioInterface])
        ? [...next[audioInterface]]
        : []

      if (selected) {
        if (!current.includes(outputName)) current.push(outputName)
      } else {
        next[audioInterface] = current.filter((value: string) => value !== outputName)
      }

      if (selected) {
        next[audioInterface] = current
      }

      this.$emit('update:mappings', next)
    },

    confirm() {
      this.$emit('confirm')
    },
  },
}
</script>

<style scoped>
.audio-preset-mapping-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.audio-preset-mapping-table {
  width: 100%;
  border-collapse: collapse;
}

.audio-preset-mapping-table th,
.audio-preset-mapping-table td {
  padding: 8px 10px;
  white-space: nowrap;
}
</style>

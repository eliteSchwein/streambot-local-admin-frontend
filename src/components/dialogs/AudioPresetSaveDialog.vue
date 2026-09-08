<template>
  <v-dialog
    :model-value="modelValue"
    width="96vw"
    max-width="1400"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar color="primary" flat density="compact">
        <v-toolbar-title>{{ $t('audio.presets.savePreset') }}</v-toolbar-title>
        <v-btn icon="mdi-close" @click="$emit('update:modelValue', false)" />
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

        <v-alert type="info" variant="tonal" density="compact">
          {{ $t('audio.presets.previewOnlyHint') }}
        </v-alert>

        <div class="audio-preset-card-grid">
        <v-card color="grey-darken-3" variant="flat">
            <v-card-title class="text-subtitle-1">
              {{ $t('audio.presets.volumes') }}
            </v-card-title>

            <v-card-text class="d-flex flex-column ga-3">
              <v-checkbox
                v-model="saveAllVolumesModel"
                :label="$t('audio.presets.saveAllVolumes')"
                hide-details
                density="comfortable"
              />

              <div v-if="audioInterfaceOptions.length" class="d-flex flex-column ga-2">
                <div class="text-caption text-medium-emphasis">
                  {{ $t('audio.presets.interfaces') }}
                </div>

                <div
                  v-for="audioInterface in audioInterfaceOptions"
                  :key="`interface-${audioInterface}`"
                  class="audio-preset-volume-row"
                >
                  <div class="audio-preset-volume-check">
                    <v-checkbox-btn
                      :model-value="isInterfaceSelected(audioInterface)"
                      density="compact"
                      @update:model-value="setInterfaceSelected(audioInterface, Boolean($event))"
                    />
                  </div>

                  <div class="audio-preset-volume-name">


                    <div class="audio-preset-volume-title">


                      {{ audioInterface }}


                    </div>


                    <div class="audio-preset-volume-percent">


                      {{ formatPercent(interfaceDraftVolume(audioInterface)) }}


                    </div>


                  </div>

                  <v-btn
                    class="audio-preset-volume-mute"
                    density="compact"
                    elevation="0"
                    variant="text"
                    :disabled="!isInterfaceSelected(audioInterface)"
                    :icon="interfaceDraftMuted(audioInterface) ? 'mdi-volume-variant-off' : 'mdi-volume-source'"
                    :color="interfaceDraftMuted(audioInterface) ? 'red' : undefined"
                    @click="toggleInterfaceDraftMute(audioInterface)"
                  />

                  <v-btn
                    class="audio-preset-volume-minus"
                    density="compact"
                    elevation="0"
                    variant="text"
                    icon="mdi-minus"
                    :disabled="!isInterfaceSelected(audioInterface) || interfaceDraftMuted(audioInterface)"
                    @click="stepInterfaceDraftVolume(audioInterface, -1)"
                  />

                  <v-slider
                    class="audio-preset-slider"
                    hide-details
                    :min="interfaceMin(audioInterface)"
                    :max="interfaceMax(audioInterface)"
                    :step="interfaceStep(audioInterface)"
                    :disabled="!isInterfaceSelected(audioInterface) || interfaceDraftMuted(audioInterface)"
                    :model-value="interfaceDraftVolume(audioInterface)"
                    @update:model-value="setInterfaceDraftVolume(audioInterface, Number($event))"
                  />

                  <v-btn
                    class="audio-preset-volume-plus"
                    density="compact"
                    elevation="0"
                    variant="text"
                    icon="mdi-plus"
                    :disabled="!isInterfaceSelected(audioInterface) || interfaceDraftMuted(audioInterface)"
                    @click="stepInterfaceDraftVolume(audioInterface, 1)"
                  />
                </div>
              </div>

              <div v-if="audioOutputs.length" class="d-flex flex-column ga-2">
                <div class="text-caption text-medium-emphasis">
                  {{ $t('audio.presets.physicalOutputs') }}
                </div>

                <div
                  v-for="output in audioOutputs"
                  :key="`physical-${outputKey(output)}`"
                  class="audio-preset-volume-row"
                >
                  <div class="audio-preset-volume-check">
                    <v-checkbox-btn
                      :model-value="isPhysicalOutputSelected(output)"
                      density="compact"
                      @update:model-value="setPhysicalOutputSelected(output, Boolean($event))"
                    />
                  </div>

                  <div class="audio-preset-volume-name">


                    <div class="audio-preset-volume-title">


                      {{ outputLabel(output) }}


                    </div>


                    <div class="audio-preset-volume-percent">


                      {{ formatPercent(physicalDraftVolume(output)) }}


                    </div>


                  </div>

                  <v-btn
                    class="audio-preset-volume-mute"
                    density="compact"
                    elevation="0"
                    variant="text"
                    :disabled="!isPhysicalOutputSelected(output)"
                    :icon="physicalDraftMuted(output) ? 'mdi-volume-variant-off' : 'mdi-volume-source'"
                    :color="physicalDraftMuted(output) ? 'red' : undefined"
                    @click="togglePhysicalDraftMute(output)"
                  />

                  <v-btn
                    class="audio-preset-volume-minus"
                    density="compact"
                    elevation="0"
                    variant="text"
                    icon="mdi-minus"
                    :disabled="!isPhysicalOutputSelected(output) || physicalDraftMuted(output)"
                    @click="stepPhysicalDraftVolume(output, -1)"
                  />

                  <v-slider
                    class="audio-preset-slider"
                    hide-details
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :disabled="!isPhysicalOutputSelected(output) || physicalDraftMuted(output)"
                    :model-value="physicalDraftVolume(output)"
                    @update:model-value="setPhysicalDraftVolume(output, Number($event))"
                  />

                  <v-btn
                    class="audio-preset-volume-plus"
                    density="compact"
                    elevation="0"
                    variant="text"
                    icon="mdi-plus"
                    :disabled="!isPhysicalOutputSelected(output) || physicalDraftMuted(output)"
                    @click="stepPhysicalDraftVolume(output, 1)"
                  />
                </div>
              </div>
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

              <div class="audio-preset-routing-list">
                <div
                  v-for="audioInterface in pipewireInterfaceOptions"
                  :key="`mapping-${audioInterface}`"
                  class="audio-preset-routing-row"
                >
                  <div class="audio-preset-routing-interface">
                    <v-icon
                      icon="mdi-tune-vertical"
                      size="small"
                      class="mr-2"
                    />
                    <span>{{ audioInterface }}</span>
                  </div>

                  <div class="audio-preset-routing-arrow">
                    <v-icon icon="mdi-arrow-right" size="small" />
                  </div>

                  <div class="audio-preset-routing-outputs">
                    <v-btn
                      v-for="output in audioOutputs"
                      :key="`${audioInterface}-${outputKey(output)}`"
                      size="small"
                      :variant="isMappingSelected(audioInterface, output) ? 'flat' : 'outlined'"
                      :color="isMappingSelected(audioInterface, output) ? 'primary' : undefined"
                      :prepend-icon="isDefaultOutput(output) ? 'mdi-star-circle' : 'mdi-speaker'"
                      class="audio-preset-routing-output"
                      @click="setMappingSelected(
                        audioInterface,
                        output,
                        !isMappingSelected(audioInterface, output),
                      )"
                    >
                      {{ outputLabel(output) }}
                    </v-btn>

                    <span
                      v-if="audioOutputs.length === 0"
                      class="text-caption text-medium-emphasis"
                    >
                      {{ $t('audio.presets.noPhysicalOutputs') }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

        </div>

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
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
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
    modelValue: { type: Boolean, default: false },
    name: { type: String, default: '' },
    saveAllVolumes: { type: Boolean, default: true },
    volumeTracks: { type: Array, default: () => [] },
    saveAllMappings: { type: Boolean, default: true },
    mappings: { type: Object, default: () => ({}) },
    audioData: { type: Object, default: () => ({}) },
    audioOutputs: { type: Array, default: () => [] },
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

  data() {
    return {
      interfaceDrafts: {} as Record<string, { volume: number, muted: boolean }>,
      physicalOutputDrafts: {} as Record<string, { volume: number, muted: boolean }>,
      physicalOutputTracks: [] as string[],
    }
  },

  computed: {
    nameModel: {
      get(): string { return this.name },
      set(value: string) { this.$emit('update:name', value) },
    },

    saveAllVolumesModel: {
      get(): boolean { return this.saveAllVolumes },
      set(value: boolean) {
        this.$emit('update:saveAllVolumes', value)

        if (value) {
          this.$emit('update:volumeTracks', [...this.audioInterfaceOptions])
          this.physicalOutputTracks = this.audioOutputs
            .map((output: any) => this.outputIdentifier(output))
            .filter(Boolean)
        } else {
          this.$emit('update:volumeTracks', [])
          this.physicalOutputTracks = []
        }
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
      get(): boolean { return this.saveAllMappings },
      set(value: boolean) {
        this.$emit('update:saveAllMappings', value)

        if (value) {
          this.$emit('update:mappings', this.getCurrentMappings())
        }
      },
    },

    audioInterfaceOptions(): string[] {
      // Preserve backend/config insertion order so this matches the main mixer.
      return Object.keys(this.audioData ?? {})
    },

    pipewireInterfaceOptions(): string[] {
      // Preserve backend/config insertion order to match the main mixer.
      return Object.entries(this.audioData ?? {})
        .filter(([, data]: [string, any]) =>
          data?.pipewire_sink === true || data?.pipewire_sink === 'true',
        )
        .map(([name]) => name)
    },

    physicalOutputOptions(): any[] {
      return (this.audioOutputs ?? []).map((output: any) => ({
        title: this.outputLabel(output),
        value: this.outputIdentifier(output),
      }))
    },

    draftInterfaceNames(): string[] {
      return this.volumeTracksModel
    },

    draftPhysicalOutputs(): any[] {
      const selected = new Set(this.physicalOutputTracks.map(String))
      return (this.audioOutputs ?? []).filter(
        (output: any) => selected.has(this.outputIdentifier(output)),
      )
    },

    hasSelection(): boolean {
      const hasVolumes =
        this.volumeTracksModel.length > 0 ||
        this.physicalOutputTracks.length > 0

      const hasMappings =
        this.saveAllMappingsModel ||
        Object.values(this.mappings ?? {}).some(
          (outputs: any) => Array.isArray(outputs) && outputs.length > 0,
        )

      return hasVolumes || hasMappings
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(value: boolean) {
        if (value) this.resetDrafts()
      },
    },
  },

  methods: {
    resetDrafts() {
      const interfaces: Record<string, { volume: number, muted: boolean }> = {}

      for (const [name, data] of Object.entries(this.audioData ?? {})) {
        const audio: any = data
        const volume = Number(audio?.current_volume ?? audio?.default_volume ?? 0)

        interfaces[name] = {
          volume: Number.isFinite(volume) ? volume : 0,
          muted: audio?.muted === true,
        }
      }

      const physical: Record<string, { volume: number, muted: boolean }> = {}

      for (const output of this.audioOutputs ?? []) {
        const name = this.outputIdentifier(output)
        if (!name) continue

        const volume = Number(output?.volume ?? 0)

        physical[name] = {
          volume: Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0,
          muted: output?.muted === true,
        }
      }

      this.interfaceDrafts = interfaces
      this.physicalOutputDrafts = physical

      // Always seed the mapping editor with the current live routing.
      this.$emit('update:mappings', this.getCurrentMappings())

      if (this.saveAllVolumesModel) {
        this.$emit('update:volumeTracks', [...this.audioInterfaceOptions])
        this.physicalOutputTracks = this.audioOutputs
          .map((output: any) => this.outputIdentifier(output))
          .filter(Boolean)
      } else {
        this.physicalOutputTracks = []
      }
    },

    isInterfaceSelected(name: string): boolean {
      return this.volumeTracksModel.includes(name)
    },

    isPhysicalOutputSelected(output: any): boolean {
      const name = this.outputIdentifier(output)
      return Boolean(name) && this.physicalOutputTracks.includes(name)
    },

    syncSaveAllVolumesState(
      interfaceTracks: string[] = this.volumeTracksModel,
      physicalTracks: string[] = this.physicalOutputTracks,
    ) {
      const allInterfacesSelected =
        interfaceTracks.length === this.audioInterfaceOptions.length &&
        this.audioInterfaceOptions.every((name: string) => interfaceTracks.includes(name))

      const physicalNames = this.audioOutputs
        .map((output: any) => this.outputIdentifier(output))
        .filter(Boolean)

      const allPhysicalSelected =
        physicalTracks.length === physicalNames.length &&
        physicalNames.every((name: string) => physicalTracks.includes(name))

      this.$emit(
        'update:saveAllVolumes',
        allInterfacesSelected && allPhysicalSelected,
      )
    },

    setInterfaceSelected(name: string, selected: boolean) {
      const current = new Set(this.volumeTracksModel)

      if (selected) current.add(name)
      else current.delete(name)

      const next = [...current]
      this.$emit('update:volumeTracks', next)
      this.syncSaveAllVolumesState(next, this.physicalOutputTracks)
    },

    setPhysicalOutputSelected(output: any, selected: boolean) {
      const name = this.outputIdentifier(output)
      if (!name) return

      const current = new Set(this.physicalOutputTracks)

      if (selected) current.add(name)
      else current.delete(name)

      this.physicalOutputTracks = [...current]
      this.syncSaveAllVolumesState(this.volumeTracksModel, this.physicalOutputTracks)
    },

    interfaceMin(name: string): number {
      return Number((this.audioData as any)?.[name]?.min_range ?? 0)
    },

    interfaceMax(name: string): number {
      return Number((this.audioData as any)?.[name]?.max_range ?? 1)
    },

    interfaceStep(name: string): number {
      const step = Number((this.audioData as any)?.[name]?.steps_range ?? 0.01)
      return Number.isFinite(step) && step > 0 ? step : 0.01
    },

    interfaceDraftVolume(name: string): number {
      return Number(this.interfaceDrafts?.[name]?.volume ?? 0)
    },

    interfaceDraftMuted(name: string): boolean {
      return this.interfaceDrafts?.[name]?.muted === true
    },

    setInterfaceDraftVolume(name: string, volume: number) {
      const min = this.interfaceMin(name)
      const max = this.interfaceMax(name)

      this.interfaceDrafts = {
        ...this.interfaceDrafts,
        [name]: {
          volume: Math.max(min, Math.min(max, volume)),
          muted: this.interfaceDraftMuted(name),
        },
      }
    },

    toggleInterfaceDraftMute(name: string) {
      this.interfaceDrafts = {
        ...this.interfaceDrafts,
        [name]: {
          volume: this.interfaceDraftVolume(name),
          muted: !this.interfaceDraftMuted(name),
        },
      }
    },

    physicalDraftVolume(output: any): number {
      return Number(this.physicalOutputDrafts?.[this.outputIdentifier(output)]?.volume ?? 0)
    },

    physicalDraftMuted(output: any): boolean {
      return this.physicalOutputDrafts?.[this.outputIdentifier(output)]?.muted === true
    },

    setPhysicalDraftVolume(output: any, volume: number) {
      const name = this.outputIdentifier(output)
      if (!name) return

      this.physicalOutputDrafts = {
        ...this.physicalOutputDrafts,
        [name]: {
          volume: Math.max(0, Math.min(1, volume)),
          muted: this.physicalDraftMuted(output),
        },
      }
    },

    stepInterfaceDraftVolume(name: string, direction: number) {
      const next = Math.max(
        this.interfaceMin(name),
        Math.min(
          this.interfaceMax(name),
          this.interfaceDraftVolume(name) + (this.interfaceStep(name) * direction),
        ),
      )

      this.setInterfaceDraftVolume(name, next)
    },

    stepPhysicalDraftVolume(output: any, direction: number) {
      const next = Math.max(
        0,
        Math.min(1, this.physicalDraftVolume(output) + (0.01 * direction)),
      )

      this.setPhysicalDraftVolume(output, next)
    },

    togglePhysicalDraftMute(output: any) {
      const name = this.outputIdentifier(output)
      if (!name) return

      this.physicalOutputDrafts = {
        ...this.physicalOutputDrafts,
        [name]: {
          volume: this.physicalDraftVolume(output),
          muted: !this.physicalDraftMuted(output),
        },
      }
    },

    formatPercent(value: number): string {
      return `${Math.round(Number(value || 0) * 100)}%`
    },

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

    getCurrentMappings(): Record<string, string[]> {
      const result: Record<string, string[]> = {}

      for (const audioInterface of this.pipewireInterfaceOptions) {
        const device: any = (this.audioData as any)?.[audioInterface] ?? {}

        const linkedOutputs = Array.isArray(device.linked_outputs)
          ? device.linked_outputs
          : Array.isArray(device.actual_linked_outputs)
            ? device.actual_linked_outputs
            : device.linked_output
              ? [device.linked_output]
              : device.actual_linked_output
                ? [device.actual_linked_output]
                : []

        result[audioInterface] = linkedOutputs
          .map((value: any) => String(value))
          .filter(Boolean)
      }

      return result
    },

    isMappingSelected(audioInterface: string, output: any): boolean {
      const outputName = this.outputIdentifier(output)
      const current = this.mappings?.[audioInterface]

      return Array.isArray(current) && current.map(String).includes(outputName)
    },

    setMappingSelected(audioInterface: string, output: any, selected: boolean) {
      const outputName = this.outputIdentifier(output)
      if (!outputName) return

      // A manual routing change makes this a custom assignment selection.
      if (this.saveAllMappingsModel) {
        this.$emit('update:saveAllMappings', false)
      }

      const next = { ...(this.mappings ?? {}) }
      const current = Array.isArray(next[audioInterface])
        ? [...next[audioInterface]]
        : []

      if (selected) {
        if (!current.includes(outputName)) current.push(outputName)
        next[audioInterface] = current
      } else {
        next[audioInterface] = current.filter((value: string) => value !== outputName)
      }

      this.$emit('update:mappings', next)
    },

    confirm() {
      const selectedInterfaces = new Set(this.draftInterfaceNames)
      const selectedPhysicalOutputs = new Set(
        this.draftPhysicalOutputs.map((output: any) => this.outputIdentifier(output)),
      )

      const volumeStates = Object.fromEntries(
        Object.entries(this.interfaceDrafts)
          .filter(([name]) => selectedInterfaces.has(name)),
      )

      const physicalOutputStates = Object.fromEntries(
        Object.entries(this.physicalOutputDrafts)
          .filter(([name]) => selectedPhysicalOutputs.has(name)),
      )

      this.$emit('confirm', {
        volume_states: volumeStates,
        physical_output_names: [...selectedPhysicalOutputs],
        physical_output_states: physicalOutputStates,
      })
    },
  },
}
</script>

<style scoped>
.audio-preset-routing-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audio-preset-routing-row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) 28px 1fr;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 8px 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
}

.audio-preset-routing-interface {
  display: flex;
  align-items: center;
  min-width: 0;
  font-weight: 600;
}

.audio-preset-routing-interface span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-preset-routing-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.55;
}

.audio-preset-routing-outputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.audio-preset-routing-output {
  text-transform: none;
  max-width: 100%;
  height: auto;
  min-height: 32px;
  white-space: normal;
}

.audio-preset-routing-output :deep(.v-btn__content) {
  white-space: normal;
  line-height: 1.2;
  text-align: left;
}

@media (max-width: 700px) {
  .audio-preset-routing-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .audio-preset-routing-arrow {
    display: none;
  }
}

.audio-preset-volume-row {
  display: grid;
  grid-template-columns:
    32px
    minmax(140px, 220px)
    40px
    40px
    minmax(220px, 1fr)
    40px;
  grid-template-areas: "check name mute minus slider plus";
  align-items: center;
  column-gap: 8px;
  min-height: 44px;
}

.audio-preset-volume-check {
  grid-area: check;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-preset-volume-name {
  grid-area: name;
  min-width: 0;
}

.audio-preset-volume-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-preset-volume-percent {
  margin-top: 2px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.75rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.audio-preset-volume-mute {
  grid-area: mute;
}

.audio-preset-volume-minus {
  grid-area: minus;
}

.audio-preset-slider {
  grid-area: slider;
  min-width: 0;
}

.audio-preset-volume-plus {
  grid-area: plus;
}


@media (max-width: 700px) {
  .audio-preset-volume-row {
    grid-template-columns: 32px minmax(100px, 1fr) 40px 40px 40px;
    grid-template-areas:
      "check name mute minus plus"
      ". slider slider slider slider";
    row-gap: 2px;
  }
}
 
.audio-preset-slider :deep(.v-slider-thumb__surface),
.audio-preset-slider :deep(.v-slider-thumb),
.audio-preset-slider :deep(.v-slider-track__fill),
.audio-preset-slider :deep(.v-slider-track__background) {
  transition: none !important;
  animation: none !important;
}

.audio-preset-card-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.audio-preset-card-grid > .v-card {
  height: 100%;
}

@media (max-width: 1250px) {
  .audio-preset-card-grid {
    grid-template-columns: 1fr;
  }
}

</style>

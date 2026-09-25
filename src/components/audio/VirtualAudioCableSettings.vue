<template>
  <v-card color="grey-darken-4" elevation="0" class="mt-3">
    <v-card-title class="d-flex align-center justify-space-between ga-3 flex-wrap">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-access-point-network" />
        <span>{{ $t('audio.virtualCables.title') }}</span>
        <v-chip size="x-small" variant="tonal">
          {{ draft.length }}
        </v-chip>
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn
          prepend-icon="mdi-plus"
          variant="tonal"
          size="small"
          :disabled="saving"
          @click="addCable"
        >
          {{ $t('audio.virtualCables.add') }}
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save-outline"
          variant="flat"
          size="small"
          :loading="saving"
          :disabled="!dirty || !isValid"
          @click="save"
        >
          {{ $t('common.save') }}
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="text-body-2 text-medium-emphasis mb-4">
        {{ $t('audio.virtualCables.description') }}
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        :text="errorMessage"
      />

      <v-alert
        v-if="!draft.length"
        type="info"
        variant="tonal"
        density="compact"
      >
        {{ $t('audio.virtualCables.empty') }}
      </v-alert>

      <v-expansion-panels
        v-else
        variant="accordion"
      >
        <v-expansion-panel
          v-for="(cable, index) in draft"
          :key="`${cable.id}-${index}`"
          color="grey-darken-3"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center ga-2 min-width-0 w-100 pr-3">
              <v-icon
                :icon="cable.enabled ? 'mdi-access-point-network' : 'mdi-access-point-network-off'"
                size="small"
              />

              <div class="min-width-0">
                <div class="text-body-2 text-truncate">
                  {{ cable.name || cable.id || $t('audio.virtualCables.unnamed') }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ sinkName(cable) }}
                </div>
              </div>

              <v-spacer />

              <v-chip
                size="x-small"
                variant="tonal"
              >
                {{ cable.channels.length }}
                {{ $t('audio.virtualCables.channelsShort') }}
              </v-chip>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-row density="compact">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="cable.id"
                  :disabled="saving"
                  :label="$t('audio.virtualCables.id')"
                  :hint="$t('audio.virtualCables.idHint')"
                  :error-messages="idErrors(index)"
                  persistent-hint
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="5">
                <v-text-field
                  v-model="cable.name"
                  :disabled="saving"
                  :label="$t('audio.virtualCables.name')"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-switch
                  v-model="cable.enabled"
                  :disabled="saving"
                  :label="$t('common.enabled')"
                  color="primary"
                  hide-details
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="cable.channels"
                  :disabled="saving"
                  :items="channelOptions"
                  item-title="title"
                  item-value="value"
                  :label="$t('audio.virtualCables.channels')"
                  :hint="$t('audio.virtualCables.channelsHint')"
                  persistent-hint
                  multiple
                  chips
                  closable-chips
                  clearable
                  prepend-inner-icon="mdi-tune-vertical"
                  variant="outlined"
                  density="comfortable"
                  :menu-props="{ maxHeight: 360 }"
                />
              </v-col>

              <v-col cols="12">
                <v-sheet
                  color="grey-darken-4"
                  rounded
                  class="pa-3 d-flex align-center justify-space-between ga-3 flex-wrap"
                >
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      {{ $t('audio.virtualCables.outputName') }}
                    </div>
                    <code>{{ sinkName(cable) }}</code>
                  </div>

                  <v-btn
                    color="error"
                    variant="text"
                    prepend-icon="mdi-delete-outline"
                    :disabled="saving"
                    @click="removeCable(index)"
                  >
                    {{ $t('common.delete') }}
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
type VirtualAudioCable = {
  id: string
  name: string
  enabled: boolean
  channels: string[]
}

export default {
  name: 'VirtualAudioCableSettings',

  props: {
    settings: {
      type: Object,
      default: () => ({}),
    },
    audioData: {
      type: Object,
      default: () => ({}),
    },
    saving: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },

  emits: ['save'],

  data() {
    return {
      draft: [] as VirtualAudioCable[],
      baseline: '[]',
    }
  },

  computed: {
    channelOptions(): Array<{ title: string; value: string }> {
      return Object.entries(this.audioData ?? {})
        .map(([key, data]: [string, any]) => ({
          title: String(data?.display_name ?? data?.displayName ?? key),
          value: String(key),
        }))
        .filter(item => item.value)
        .sort((a, b) =>
          a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true }),
        )
    },

    dirty(): boolean {
      return JSON.stringify(this.normalizedDraft()) !== this.baseline
    },

    isValid(): boolean {
      if (!this.draft.every((cable: VirtualAudioCable) =>
        Boolean(this.normalizeId(cable.id)) && Boolean(String(cable.name ?? '').trim())
      )) {
        return false
      }

      const ids = this.draft.map((cable: VirtualAudioCable) => this.normalizeId(cable.id))
      return new Set(ids).size === ids.length
    },
  },

  watch: {
    settings: {
      immediate: true,
      deep: true,
      handler() {
        if (this.saving) return
        this.loadFromSettings()
      },
    },
  },

  methods: {
    normalizeId(value: any): string {
      return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },

    normalizeCable(raw: any, index: number): VirtualAudioCable {
      const id = this.normalizeId(raw?.id ?? raw?.name ?? `overlay-${index + 1}`)
      const channels = Array.from(new Set(
        (Array.isArray(raw?.channels) ? raw.channels : [])
          .map((channel: any) => String(channel ?? '').trim())
          .filter(Boolean),
      ))

      return {
        id,
        name: String(raw?.name ?? id).trim() || id,
        enabled: raw?.enabled !== false,
        channels,
      }
    },

    normalizedDraft(): VirtualAudioCable[] {
      return this.draft.map((cable: VirtualAudioCable, index: number) =>
        this.normalizeCable(cable, index)
      )
    },

    loadFromSettings() {
      const raw = this.settings?.virtual_audio_cables ?? []
      const list = Array.isArray(raw)
        ? raw
        : Object.entries(raw ?? {}).map(([id, value]: [string, any]) => ({
            id,
            ...(value && typeof value === 'object' ? value : {}),
          }))

      this.draft = list.map((cable: any, index: number) =>
        this.normalizeCable(cable, index)
      )

      this.baseline = JSON.stringify(this.normalizedDraft())
    },

    sinkName(cable: VirtualAudioCable): string {
      const id = this.normalizeId(cable?.id)
      return id ? `streambot_virtual_${id}` : 'streambot_virtual_…'
    },

    idErrors(index: number): string[] {
      const cable = this.draft[index]
      const id = this.normalizeId(cable?.id)

      if (!id) {
        return [String(this.$t('audio.virtualCables.idRequired'))]
      }

      const duplicate = this.draft.some(
        (entry: VirtualAudioCable, entryIndex: number) =>
          entryIndex !== index && this.normalizeId(entry.id) === id,
      )

      return duplicate
        ? [String(this.$t('audio.virtualCables.idDuplicate'))]
        : []
    },

    addCable() {
      const used = new Set(
        this.draft.map((cable: VirtualAudioCable) => this.normalizeId(cable.id))
      )

      let number = Math.max(1, this.draft.length + 1)
      let id = `overlay-${number}`

      while (used.has(id)) {
        number += 1
        id = `overlay-${number}`
      }

      this.draft.push({
        id,
        name: `Overlay ${number}`,
        enabled: true,
        channels: [],
      })
    },

    removeCable(index: number) {
      this.draft.splice(index, 1)
    },

    save() {
      if (!this.isValid || this.saving) return
      const normalized = this.normalizedDraft()
      this.$emit('save', normalized)
    },

    markSaved(cables: VirtualAudioCable[]) {
      this.draft = cables.map((cable: VirtualAudioCable, index: number) =>
        this.normalizeCable(cable, index)
      )
      this.baseline = JSON.stringify(this.normalizedDraft())
    },
  },
}
</script>

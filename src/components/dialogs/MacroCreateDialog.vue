<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-code-braces" class="mr-2" />
          <span class="text-truncate">{{ $t('dialogs.macroCreateDialog.title') }}</span>
        </v-toolbar-title>

        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert
          v-if="errorMessage"
          type="error"
          color="red-darken-3"
          density="comfortable"
          class="mb-3"
          :text="errorMessage"
        />

        <v-text-field
          v-model="name"
          :label="$t('dialogs.macroCreateDialog.name')"
          suffix=".yaml"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          autofocus
          class="mb-3"
          @keydown.enter.prevent="createMacro"
        />

        <v-select
          v-if="presetItems.length"
          v-model="selectedPreset"
          :items="presetItems"
          item-title="title"
          item-value="value"
          :label="$t('common.preset')"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />

        <v-alert
          v-else
          type="info"
          color="grey-darken-3"
          density="comfortable"
          variant="tonal"
          :text="$t('dialogs.macroCreateDialog.noPresets')"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-spacer />

        <v-btn variant="text" @click="close">
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          :loading="loading"
          :disabled="!canCreate"
          @click="createMacro"
        >
          {{ $t('macro.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { getWebsocketClient } from '@/plugins/websocketInstance'

const presetFiles = import.meta.glob('../../presets/macros/*.{yaml,yml}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export default {
  name: 'MacroCreateDialog',

  props: {
    modelValue: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'created'],

  data() {
    return {
      name: '',
      selectedPreset: '',
      loading: false,
      errorMessage: '',
    }
  },

  computed: {
    presetItems(): Array<{ title: string; value: string }> {
      return Object.keys(presetFiles)
        .sort((a, b) => a.localeCompare(b))
        .map((file) => {
          const presetName = file.split('/').pop()?.replace(/\.ya?ml$/i, '') ?? file

          return {
            title: this.formatPresetName(presetName),
            value: file,
          }
        })
    },

    normalizedName(): string {
      return String(this.name ?? '')
        .trim()
        .replace(/^\/+/, '')
        .replace(/\.ya?ml$/i, '')
    },

    canCreate(): boolean {
      return Boolean(this.normalizedName) && Boolean(this.selectedPreset) && !this.loading
    },

    targetPath(): string {
      return `${this.normalizedName}.yaml`
    },
  },

  watch: {
    modelValue(value: boolean) {
      if (value) this.prepareDialog()
    },
  },

  mounted() {
    this.prepareDialog()
  },

  methods: {
    prepareDialog() {
      this.errorMessage = ''

      if (!this.selectedPreset && this.presetItems.length) {
        this.selectedPreset = this.presetItems[0].value
      }
    },

    close() {
      this.$emit('update:modelValue', false)
      this.name = ''
      this.errorMessage = ''
      this.loading = false
    },

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 10_000): Promise<any> {
      const client = getWebsocketClient()

      if (!client) {
        throw new Error(this.$t('macro.errors.websocketDisconnected'))
      }

      const response = await client.request(method, params, timeout)
      return response?.params ?? response
    },

    getPresetContent(): string {
      return String((presetFiles as any)[this.selectedPreset] ?? '')
    },

    formatPresetName(value: string): string {
      return String(value ?? '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    },

    async createMacro() {
      if (!this.canCreate) return

      this.loading = true
      this.errorMessage = ''

      try {
        const response = await this.requestWebsocket('macro_edit', {
          path: this.targetPath,
          content: this.getPresetContent(),
        })

        const data = response?.data ?? response

        if (data?.error) {
          throw new Error(data.error)
        }

        this.$emit('created', this.targetPath)
        this.close()
      } catch (error: any) {
        this.errorMessage = error?.message ?? this.$t('dialogs.macroCreateDialog.createFailed')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

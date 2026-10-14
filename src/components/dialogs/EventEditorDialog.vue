<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="event-dialog">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-lightning-bolt" class="mr-2" />
          <span class="text-truncate">{{ title }}</span>
        </v-toolbar-title>

        <YamlImportExportButtons
          class="mr-2"
          :filename="exportFilename"
          :disabled="loading || savingInternal"
          :export-resolver="buildEventExportBundle"
          @import="importEventBundle"
          @error="handleImportError"
        />

        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-toolbar>

      <v-divider />

      <v-card-text class="py-3 px-0">
        <v-alert
          v-if="error || errorMessage"
          type="error"
          color="red-darken-3"
          density="comfortable"
          class="mb-4 mx-4"
          :text="error || errorMessage"
        />

        <div class="px-4 mb-3">
          <v-row density="comfortable">
            <v-col cols="12" sm="4">
              <v-switch v-model="bypassInteractionQueue" :label="$t('dialogs.eventEditorDialog.bypassInteractionQueue')" color="primary" density="comfortable" hide-details inset />
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch v-model="stripEmotes" :label="$t('dialogs.eventEditorDialog.stripEmotes')" color="primary" density="comfortable" hide-details inset />
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch v-model="stripUrls" :label="$t('dialogs.eventEditorDialog.stripUrls')" color="primary" density="comfortable" hide-details inset />
            </v-col>
          </v-row>
        </div>

        <v-expansion-panels v-model="openPanels" variant="accordion" @update:model-value="onPanelsChanged">
          <v-expansion-panel v-if="!isSystemEvent" value="asset">
            <v-expansion-panel-title>
              <div class="d-flex align-center ga-2 min-width-0">
                <v-icon icon="mdi-palette" />
                <span class="text-truncate">{{ $t('dialogs.eventEditorDialog.asset') }}</span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text eager>
              <v-progress-linear v-if="assetLoading" indeterminate class="mb-3" />
              <EventAssetAccordion
                v-show="!assetLoading"
                ref="assetAccordion"
                :name="configName"
                :disabled="loading || savingInternal"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="macro">
            <v-expansion-panel-title :hide-actions="isSystemEvent">
              <div class="d-flex align-center ga-2 min-width-0">
                <v-icon icon="mdi-code-braces" />
                <span class="text-truncate">{{ $t('dialogs.eventEditorDialog.macro') }}</span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text eager>
              <v-progress-linear v-if="macroLoading" indeterminate class="mb-3" />
              <EventMacroAccordion
                v-show="!macroLoading"
                ref="macroAccordion"
                :name="configName"
                :initial-content="macroContent"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>

        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          prepend-icon="mdi-play"
          color="secondary"
          variant="tonal"
          :disabled="!canSimulate"
          @click="openSimulationDialog"
        >
          {{ $t('dialogs.eventEditorDialog.simulate') }}
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          prepend-icon="mdi-close"
          :disabled="loading || savingInternal"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-content-save"
          :loading="loading || savingInternal"
          :disabled="!canSave"
          @click="save"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <EventSimulationDialog
    v-model="simulationDialog"
    :event-entry="eventEntry"
    :disabled="loading || savingInternal"
  />


</template>

<script lang="ts">
import { getWebsocketClient } from '@/plugins/websocketInstance'
import EventAssetAccordion from '@/components/accordions/EventAssetAccordion.vue'
import EventMacroAccordion from '@/components/accordions/EventMacroAccordion.vue'
import EventSimulationDialog from '@/components/dialogs/EventSimulationDialog.vue'
import YamlImportExportButtons from '@/components/YamlImportExportButtons.vue'
import YAML from 'yaml'


export default {
  name: 'EventEditorDialog',

  components: {
    EventAssetAccordion,
    EventMacroAccordion,
    EventSimulationDialog,
    YamlImportExportButtons,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    eventEntry: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },

  emits: ['update:modelValue', 'save'],

  data() {
    return {
      openPanels: [] as string[],
      macroContent: '',
      errorMessage: '',
      savingInternal: false,
      simulationDialog: false,
      bypassInteractionQueue: false,
      stripEmotes: false,
      stripUrls: false,
      assetLoading: false,
      macroLoading: false,
    }
  },

  computed: {
    configName(): string {
      return String(this.eventEntry?.configName ?? '')
    },


    isSystemEvent(): boolean {
      return this.configName.startsWith('event_system')
    },

    eventDisplayName(): string {
      const localeKey = String(this.eventEntry?.localeKey ?? '')

      if (localeKey && (this as any).$te?.(localeKey)) {
        return String((this as any).$t(localeKey))
      }

      return this.configName
    },

    title(): string {
      return this.configName
        ? String((this as any).$t('dialogs.eventEditorDialog.editTitle', { event: this.eventDisplayName }))
        : String((this as any).$t('dialogs.eventEditorDialog.title'))
    },

    exportFilename(): string {
      return `${this.configName || 'event'}.yaml`
    },

    canSave(): boolean {
      return this.configName.length > 0 && !this.loading && !this.savingInternal
    },

    canSimulate(): boolean {
      return this.configName.length > 0
        && Array.isArray(this.eventEntry?.simulationFields)
        && this.eventEntry.simulationFields.length > 0
        && !this.loading
        && !this.savingInternal
    },
  },

  watch: {
    configName() {
      this.applyPanelState()
    },

    modelValue(value: boolean) {
      if (value) {
        this.applyPanelState()
      }
    },
  },

  methods: {
    async open() {
      this.errorMessage = ''
      this.bypassInteractionQueue = this.eventEntry?.bypass_interaction_queue === true || this.eventEntry?.bypassInteractionQueue === true
      this.stripEmotes = this.eventEntry?.strip_emotes === true || this.eventEntry?.stripEmotes === true
      this.stripUrls = this.eventEntry?.strip_urls === true || this.eventEntry?.stripUrls === true
      this.macroContent = this.defaultMacroContent(this.configName)
      this.assetLoading = !this.isSystemEvent
      this.macroLoading = true
      this.applyPanelState()
      await this.$nextTick()
      void this.loadExistingGeneratedFiles()
    },

    applyPanelState() {
      this.openPanels = this.isSystemEvent ? ['macro'] : []
    },

    onPanelsChanged(value: string[]) {
      if (this.isSystemEvent && !value.includes('macro')) {
        this.openPanels = ['macro']
      }
    },

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 15_000): Promise<any> {
      const client = getWebsocketClient()

      if (!client) {
        throw new Error(String((this as any).$t('dialogs.eventEditorDialog.websocketDisconnected')))
      }

      const response = await client.request(method, params, timeout)
      return response?.params ?? response
    },

    async requestEventEndpoint(method: string, params: Record<string, any> = {}, timeout = 15_000): Promise<any> {
      const response = await this.requestWebsocket(method, params, timeout)
      const data = response?.data ?? response

      if (data?.error) {
        throw new Error(data.error)
      }

      return data
    },

    async loadExistingGeneratedFiles() {
      if (!this.configName) return

      const loaders = [this.loadExistingMacro()]

      if (!this.isSystemEvent) {
        loaders.push(this.loadExistingAsset())
      }

      await Promise.allSettled(loaders)
    },

    async loadExistingAsset() {
      await this.$nextTick()
      try {
        await (this.$refs.assetAccordion as any)?.open?.(this.configName)
      } catch (error) {
        ;(this.$refs.assetAccordion as any)?.setAsset?.({ channel: 'general', duration: 5 })
      } finally {
        this.assetLoading = false
      }
    },

    async loadExistingMacro() {
      try {
        const data = await this.requestEventEndpoint('macro_read', {
          name: this.configName,
          path: `${this.configName}.yaml`,
          file: `${this.configName}.yaml`,
        })

        this.macroContent = String(data?.content ?? this.defaultMacroContent(this.configName))
      } catch (error) {
        this.macroContent = this.defaultMacroContent(this.configName)
      }

      await this.$nextTick()
      ;(this.$refs.macroAccordion as any)?.setContent?.(this.macroContent, this.configName)
      this.macroLoading = false
    },

    defaultMacroContent(name: string) {
      return `name: ${name}\ntasks: []\n`
    },

    normalizeImportedMacroContent(content: any): string {
      let document: any

      if (typeof content === 'string') {
        try {
          document = YAML.parse(content)
        } catch {
          return String(content ?? '')
        }
      } else if (content && typeof content === 'object' && !Array.isArray(content)) {
        document = content
      } else {
        return this.defaultMacroContent(this.configName)
      }

      if (!document || typeof document !== 'object' || Array.isArray(document)) {
        return this.defaultMacroContent(this.configName)
      }

      // Imports are configuration copies. They must never rename the event target.
      document.name = this.configName
      return YAML.stringify(document, { lineWidth: 0 })
    },

    currentMacroContent(): string {
      const content = (this.$refs.macroAccordion as any)?.getContent?.()
        || this.macroContent
        || this.defaultMacroContent(this.configName)

      return this.withEventOptions(this.normalizeImportedMacroContent(content))
    },

    async buildEventExportBundle() {
      const macroContent = this.currentMacroContent()
      const assetContent = this.isSystemEvent
        ? undefined
        : ((this.$refs.assetAccordion as any)?.getAssetPayload?.() ?? {})

      return {
        streambot_export: {
          version: 1,
          kind: 'event',
        },
        config: {
          name: this.configName,
          bypass_interaction_queue: this.bypassInteractionQueue,
          strip_emotes: this.stripEmotes,
          strip_urls: this.stripUrls,
        },
        ...(this.isSystemEvent
          ? {}
          : {
              asset: {
                name: this.configName,
                content: assetContent,
              },
            }),
        macro: {
          name: this.configName,
          content: macroContent,
        },
      }
    },

    async importEventBundle(payload: any) {
      this.errorMessage = ''

      try {
        const data = payload?.data ?? {}
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Imported YAML must be an object')
        }

        const config = data?.config && typeof data.config === 'object' && !Array.isArray(data.config)
          ? data.config
          : {}

        let macroSource: any = data?.macro?.content

        // Also accept a normal standalone macro export.
        if (macroSource === undefined && (Array.isArray(data?.tasks) || data?.name)) {
          macroSource = data
        }

        if (macroSource !== undefined) {
          const macroContent = this.normalizeImportedMacroContent(macroSource)
          this.macroContent = macroContent

          try {
            const macroData = YAML.parse(macroContent)
            if (typeof macroData?.bypass_interaction_queue === 'boolean') this.bypassInteractionQueue = macroData.bypass_interaction_queue
            if (typeof macroData?.strip_emotes === 'boolean') this.stripEmotes = macroData.strip_emotes
            if (typeof macroData?.strip_urls === 'boolean') this.stripUrls = macroData.strip_urls
          } catch {
            // The macro editor will surface malformed content if necessary.
          }

          await this.$nextTick()
          ;(this.$refs.macroAccordion as any)?.setContent?.(macroContent, this.configName)
        }

        if (typeof config?.bypass_interaction_queue === 'boolean') this.bypassInteractionQueue = config.bypass_interaction_queue
        if (typeof config?.strip_emotes === 'boolean') this.stripEmotes = config.strip_emotes
        if (typeof config?.strip_urls === 'boolean') this.stripUrls = config.strip_urls

        if (!this.isSystemEvent && data?.asset?.content && typeof data.asset.content === 'object') {
          await this.$nextTick()
          await (this.$refs.assetAccordion as any)?.setAsset?.(data.asset.content)
        }
      } catch (error: any) {
        this.errorMessage = error?.message ?? String(error ?? 'event import failed')
      }
    },

    handleImportError(error: any) {
      this.errorMessage = error?.message ?? String(error ?? 'event import failed')
    },

    openSimulationDialog() {
      if (!this.canSimulate) return
      this.simulationDialog = true
    },

    withEventOptions(content: string) {
      let value = String(content ?? '')
      const options = [
        ['bypass_interaction_queue', this.bypassInteractionQueue],
        ['strip_emotes', this.stripEmotes],
        ['strip_urls', this.stripUrls],
      ] as const

      const missing: string[] = []
      for (const [key, enabled] of options) {
        const line = `${key}: ${enabled ? 'true' : 'false'}`
        const pattern = new RegExp(`^${key}\\s*:.*$`, 'm')
        if (pattern.test(value)) value = value.replace(pattern, line)
        else missing.push(line)
      }

      if (!missing.length) return value
      if (/^name\s*:/m.test(value)) {
        return value.replace(/^(name\s*:.*)$/m, `$1\n${missing.join('\n')}`)
      }
      return `${missing.join('\n')}\n${value}`
    },

    save() {
      if (!this.canSave) return

      const macroContent = (this.$refs.macroAccordion as any)?.getContent?.() || this.macroContent || this.defaultMacroContent(this.configName)

      this.$emit('save', {
        name: this.configName,
        skipAsset: this.isSystemEvent,
        asset: this.isSystemEvent ? undefined : ((this.$refs.assetAccordion as any)?.getAssetPayload?.() ?? {}),
        macroContent: this.withEventOptions(macroContent),
      })
    },
  },
}
</script>

<style scoped lang="scss">
.min-width-0 {
  min-width: 0;
}

</style>

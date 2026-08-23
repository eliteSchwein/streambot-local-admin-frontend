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

        <v-expansion-panels v-model="openPanels" variant="accordion" @update:model-value="onPanelsChanged">
          <v-expansion-panel v-if="!isSystemEvent" value="asset">
            <v-expansion-panel-title>
              <div class="d-flex align-center ga-2 min-width-0">
                <v-icon icon="mdi-palette" />
                <span class="text-truncate">{{ $t('dialogs.eventEditorDialog.asset') }}</span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text eager>
              <EventAssetAccordion
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
              <EventMacroAccordion
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
          :loading="simulating"
          :disabled="!canSimulate"
          @click="openSimulationDialog"
        >
          {{ $t('dialogs.eventEditorDialog.simulate') }}
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ $t('dialogs.eventEditorDialog.cancel') }}
        </v-btn>
        <v-btn color="primary" variant="flat" :loading="loading || savingInternal" :disabled="!canSave" @click="save">
          {{ $t('dialogs.eventEditorDialog.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="simulationDialog"
    max-width="1100"
  >
    <v-card color="grey-darken-4">
      <v-toolbar density="compact" flat>
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-play-circle-outline" class="mr-2" />
          <span class="text-truncate">
            {{ $t('dialogs.eventEditorDialog.simulation') }} — {{ eventDisplayName }}
          </span>
        </v-toolbar-title>

        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="simulating"
          @click="simulationDialog = false"
        />
      </v-toolbar>

      <v-divider />

      <v-card-text class="py-4 px-4">
        <v-alert
          v-if="errorMessage"
          type="error"
          color="red-darken-3"
          density="comfortable"
          class="mb-4"
          :text="errorMessage"
        />

        <v-alert
          v-if="simulationSuccess"
          type="success"
          density="comfortable"
          class="mb-4"
          :text="$t('dialogs.eventEditorDialog.simulationTriggered')"
        />

        <div v-if="simulationFields.length" class="simulation-grid">
          <template v-for="field in simulationFields" :key="field.name">
            <v-switch
              v-if="field.type === 'boolean'"
              v-model="simulationValues[field.name]"
              :label="simulationFieldLabel(field)"
              color="primary"
              density="comfortable"
              variant="outlined"
              hide-details
            />

            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="simulationValues[field.name]"
              :label="simulationFieldLabel(field)"
              :required="field.required"
              variant="outlined"
              rows="3"
              auto-grow
              density="comfortable"
              hide-details="auto"
            />

            <v-select
              v-else-if="field.type === 'select'"
              v-model="simulationValues[field.name]"
              :disabled="simulating"
              :label="simulationFieldLabel(field)"
              :items="field.options ?? []"
              item-title="title"
              item-value="value"
              :required="field.required"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />

            <v-number-input
              v-else-if="field.type === 'number'"
              v-model="simulationValues[field.name]"
              :disabled="simulating"
              :label="simulationFieldLabel(field)"
              :required="field.required"
              :min="field.min"
              :max="field.max"
              :step="field.step ?? 1"
              hide-details="auto"
              variant="outlined"
            />

            <v-text-field
              v-else
              v-model="simulationValues[field.name]"
              :label="simulationFieldLabel(field)"
              type="text"
              :required="field.required"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </template>
        </div>

        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="comfortable"
          :text="$t('dialogs.eventEditorDialog.noSimulationFields')"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="simulating"
          @click="simulationDialog = false"
        >
          {{ $t('dialogs.eventEditorDialog.cancel') }}
        </v-btn>
        <v-btn
          prepend-icon="mdi-play"
          color="secondary"
          variant="flat"
          :loading="simulating"
          :disabled="!canSimulate"
          @click="simulate"
        >
          {{ $t('dialogs.eventEditorDialog.simulate') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script lang="ts">
import { getWebsocketClient } from '@/plugins/websocketInstance'
import EventAssetAccordion from '@/components/accordions/EventAssetAccordion.vue'
import EventMacroAccordion from '@/components/accordions/EventMacroAccordion.vue'

type SimulationField = {
  name: string
  type: 'text' | 'number' | 'boolean' | 'textarea' | 'select'
  localeKey?: string
  json?: boolean
  default?: string | number | boolean
  required?: boolean
  min?: number
  max?: number
  step?: number
  options?: Array<{
    title: string
    value: string | number | boolean
  }>
}

export default {
  name: 'EventEditorDialog',

  components: {
    EventAssetAccordion,
    EventMacroAccordion,
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
      simulating: false,
      simulationDialog: false,
      simulationSuccess: false,
      simulationValues: {} as Record<string, any>,
    }
  },

  computed: {
    configName(): string {
      return String(this.eventEntry?.configName ?? '')
    },

    simulationFields(): SimulationField[] {
      return Array.isArray(this.eventEntry?.simulationFields)
        ? this.eventEntry.simulationFields
        : []
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

    canSave(): boolean {
      return this.configName.length > 0 && !this.loading && !this.savingInternal && !this.simulating
    },

    canSimulate(): boolean {
      return this.configName.length > 0
        && this.simulationFields.length > 0
        && !this.loading
        && !this.savingInternal
        && !this.simulating
    },
  },

  watch: {
    configName() {
      this.resetSimulationForm()
      this.applyPanelState()
    },

    modelValue(value: boolean) {
      if (value) {
        this.resetSimulationForm()
        this.applyPanelState()
      }
    },

    simulationFields: {
      deep: true,
      handler() {
        this.resetSimulationForm()
      },
    },
  },

  methods: {
    async open() {
      this.errorMessage = ''
      this.simulationSuccess = false
      this.macroContent = this.defaultMacroContent(this.configName)
      this.resetSimulationForm()
      this.applyPanelState()
      await this.$nextTick()
      await this.loadExistingGeneratedFiles()
      this.applyPanelState()
    },

    resetSimulationForm() {
      this.simulationSuccess = false
      this.simulationValues = Object.fromEntries(
        this.simulationFields.map(field => [
          field.name,
          field.default ?? (field.type === 'boolean' ? false : ''),
        ]),
      )
    },

    simulationFieldLabel(field: SimulationField): string {
      if (field.localeKey && (this as any).$te?.(field.localeKey)) {
        return String((this as any).$t(field.localeKey))
      }

      return field.name
    },

    simulationSelectItems(field: SimulationField) {
      if (field.optionsByField && field.optionsByValue) {
        const sourceValue = String(this.simulationValues[field.optionsByField] ?? '')
        return field.optionsByValue[sourceValue] ?? []
      }

      return field.options ?? []
    },

    onSimulationSelectChanged(field: SimulationField) {
      for (const dependentField of this.simulationFields) {
        if (dependentField.optionsByField !== field.name) continue

        const items = this.simulationSelectItems(dependentField)
        const currentValue = this.simulationValues[dependentField.name]

        if (items.some(item => item.value === currentValue)) continue

        this.simulationValues[dependentField.name] = items[0]?.value ?? dependentField.default ?? ''
      }
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

      await Promise.all(loaders)
    },

    async loadExistingAsset() {
      await this.$nextTick()
      try {
        await (this.$refs.assetAccordion as any)?.open?.(this.configName)
      } catch (error) {
        ;(this.$refs.assetAccordion as any)?.setAsset?.({ channel: 'general', duration: 5 })
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
    },

    defaultMacroContent(name: string) {
      return `name: ${name}\ntasks: []\n`
    },

    openSimulationDialog() {
      if (!this.canSimulate) return

      this.errorMessage = ''
      this.simulationSuccess = false
      this.resetSimulationForm()
      this.simulationDialog = true
    },

    async simulate() {
      if (!this.canSimulate) return

      this.errorMessage = ''
      this.simulationSuccess = false
      this.simulating = true

      try {
        const event = Object.fromEntries(
          this.simulationFields.map(field => {
            const value = this.simulationValues[field.name]

            if (!field.json) {
              return [field.name, value]
            }

            try {
              return [field.name, JSON.parse(String(value ?? ''))]
            } catch (error) {
              throw new Error(
                String((this as any).$t('dialogs.eventEditorDialog.invalidSimulationJson', {
                  field: this.simulationFieldLabel(field),
                }))
              )
            }
          }),
        )

        await this.requestEventEndpoint('events_simulate', {
          configName: this.configName,
          event,
        })
        this.simulationSuccess = true
      } catch (error: any) {
        this.errorMessage = error?.message ?? String((this as any).$t('dialogs.eventEditorDialog.simulationFailed'))
      } finally {
        this.simulating = false
      }
    },

    save() {
      if (!this.canSave) return

      this.$emit('save', {
        name: this.configName,
        skipAsset: this.isSystemEvent,
        asset: this.isSystemEvent ? undefined : ((this.$refs.assetAccordion as any)?.getAssetPayload?.() ?? {}),
        macroContent: (this.$refs.macroAccordion as any)?.getContent?.() || this.macroContent || this.defaultMacroContent(this.configName),
      })
    },
  },
}
</script>

<style scoped lang="scss">
.min-width-0 {
  min-width: 0;
}

.simulation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.simulation-number-field {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 56px;
  align-items: start;
  gap: 10px;
}

.simulation-number-button {
  min-width: 56px;
  width: 56px;
  height: 56px;
}

.simulation-number-input :deep(input[type='number']) {
  appearance: textfield;
  -moz-appearance: textfield;
}

.simulation-number-input :deep(input[type='number']::-webkit-inner-spin-button),
.simulation-number-input :deep(input[type='number']::-webkit-outer-spin-button) {
  margin: 0;
  -webkit-appearance: none;
}
</style>

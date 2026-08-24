<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1100"
    @update:model-value="$emit('update:modelValue', $event)"
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
          @click="$emit('update:modelValue', false)"
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
              :disabled="simulating"
              :label="simulationFieldLabel(field)"
              color="primary"
              density="comfortable"
              variant="outlined"
              hide-details
            />

            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="simulationValues[field.name]"
              :disabled="simulating"
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
              :items="simulationSelectItems(field)"
              item-title="title"
              item-value="value"
              :required="field.required"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="onSimulationSelectChanged(field)"
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
              :disabled="simulating"
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
          @click="$emit('update:modelValue', false)"
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

type SimulationOption = {
  title: string
  value: string | number | boolean
}

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
  options?: SimulationOption[]
  optionsByField?: string
  optionsByValue?: Record<string, SimulationOption[]>
}

export default {
  name: 'EventSimulationDialog',

  props: {
    modelValue: { type: Boolean, default: false },
    eventEntry: { type: Object, default: null },
    disabled: { type: Boolean, default: false },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      simulating: false,
      simulationSuccess: false,
      errorMessage: '',
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

    eventDisplayName(): string {
      const localeKey = String(this.eventEntry?.localeKey ?? '')

      if (localeKey && (this as any).$te?.(localeKey)) {
        return String((this as any).$t(localeKey))
      }

      return this.configName
    },

    canSimulate(): boolean {
      return this.configName.length > 0
        && this.simulationFields.length > 0
        && !this.disabled
        && !this.simulating
    },
  },

  watch: {
    modelValue(value: boolean) {
      if (value) this.resetSimulationForm()
    },

    configName() {
      this.resetSimulationForm()
    },

    simulationFields: {
      deep: true,
      handler() {
        this.resetSimulationForm()
      },
    },
  },

  created() {
    this.resetSimulationForm()
  },

  methods: {
    resetSimulationForm() {
      this.errorMessage = ''
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

    simulationSelectItems(field: SimulationField): SimulationOption[] {
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

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 15_000): Promise<any> {
      const client = getWebsocketClient()

      if (!client) {
        throw new Error(String((this as any).$t('dialogs.eventEditorDialog.websocketDisconnected')))
      }

      const response = await client.request(method, params, timeout)
      return response?.params ?? response
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
            } catch {
              throw new Error(
                String((this as any).$t('dialogs.eventEditorDialog.invalidSimulationJson', {
                  field: this.simulationFieldLabel(field),
                }))
              )
            }
          }),
        )

        const response = await this.requestWebsocket('events_simulate', {
          configName: this.configName,
          event,
        })

        const data = response?.data ?? response

        if (data?.error) {
          throw new Error(data.error)
        }

        this.simulationSuccess = true
      } catch (error: any) {
        this.errorMessage = error?.message
          ?? String((this as any).$t('dialogs.eventEditorDialog.simulationFailed'))
      } finally {
        this.simulating = false
      }
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
</style>

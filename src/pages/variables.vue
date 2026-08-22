<template>
  <v-card color="transparent">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-variable" />
        <div class="min-width-0">
          <div class="text-truncate">{{ $t('variables.title') }}</div>
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <v-text-field
        v-model="searchQuery"
        :label="$t('variables.search')"
        prepend-inner-icon="mdi-magnify"
        clearable
        variant="outlined"
        density="comfortable"
        hide-details
        class="mb-4"
      />

      <section>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon icon="mdi-content-save" />
          <div class="text-subtitle-1">{{ $t('variables.persistentTitle') }}</div>
          <v-chip size="x-small" variant="tonal">
            {{ filteredPersistentVariables.length }}
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis mb-3">
          {{ $t('variables.persistentDescription') }}
        </div>

        <v-alert
          v-if="filteredPersistentVariables.length === 0"
          type="info"
          color="grey-darken-3"
          :text="$t('variables.emptyPersistent')"
        />

        <v-list
          v-else
          density="compact"
          bg-color="transparent"
          class="variables-list"
        >
          <v-list-item
            v-for="variable in filteredPersistentVariables"
            :key="variable.key"
          >
            <template #prepend>
              <v-icon icon="mdi-variable" />
            </template>

            <v-list-item-title>{{ variable.key }}</v-list-item-title>

            <template #append>
              <div class="variables-list__actions">
                <v-text-field
                  :model-value="draftValues[variable.key] ?? valueToInput(variable.value)"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="variables-list__input"
                  @update:model-value="draftValues[variable.key] = String($event ?? '')"
                  @keyup.enter="saveVariable(variable)"
                />

                <v-btn
                  icon="mdi-content-save"
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="saveVariable(variable)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="red"
                  @click.stop="deleteVariable(variable)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </section>

      <v-divider class="my-5" />

      <section>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon icon="mdi-memory" />
          <div class="text-subtitle-1">{{ $t('variables.runtimeTitle') }}</div>
          <v-chip size="x-small" variant="tonal">
            {{ filteredRuntimeVariables.length }}
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis mb-3">
          {{ $t('variables.runtimeDescription') }}
        </div>

        <v-alert
          v-if="filteredRuntimeVariables.length === 0"
          type="info"
          color="grey-darken-3"
          :text="$t('variables.emptyRuntime')"
        />

        <v-list
          v-else
          density="compact"
          bg-color="transparent"
          class="variables-list"
        >
          <v-list-item
            v-for="variable in filteredRuntimeVariables"
            :key="variable.key"
          >
            <template #prepend>
              <v-icon icon="mdi-variable" />
            </template>

            <v-list-item-title>{{ variable.key }}</v-list-item-title>

            <template #append>
              <div class="variables-list__actions">
                <v-text-field
                  :model-value="draftValues[variable.key] ?? valueToInput(variable.value)"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="variables-list__input"
                  @update:model-value="draftValues[variable.key] = String($event ?? '')"
                  @keyup.enter="saveVariable(variable)"
                />

                <v-btn
                  icon="mdi-content-save"
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="saveVariable(variable)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="red"
                  @click.stop="deleteVariable(variable)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </section>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

type VariableItem = {
  key: string
  value: any
}

export default {
  name: 'Variables',

  data() {
    return {
      searchQuery: '',
      draftValues: {} as Record<string, string>,
    }
  },

  computed: {
    ...mapState(useAppStore, ['getVariables']),

    variablePayload(): any {
      return this.getVariables ?? {}
    },

    variableValues(): Record<string, any> {
      if (
        this.variablePayload &&
        typeof this.variablePayload === 'object' &&
        this.variablePayload.values &&
        typeof this.variablePayload.values === 'object'
      ) {
        return this.variablePayload.values
      }

      return this.variablePayload
    },

    persistentKeys(): Set<string> {
      const keys = Array.isArray(this.variablePayload?.persistent_keys)
        ? this.variablePayload.persistent_keys
        : []

      return new Set(keys.map((key: any) => String(key)))
    },

    variableList(): VariableItem[] {
      return Object.entries(this.variableValues)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => a.key.localeCompare(b.key))
    },

    persistentVariables(): VariableItem[] {
      return this.variableList.filter(variable => this.persistentKeys.has(variable.key))
    },

    runtimeVariables(): VariableItem[] {
      return this.variableList.filter(variable => !this.persistentKeys.has(variable.key))
    },

    filteredPersistentVariables(): VariableItem[] {
      return this.filterVariables(this.persistentVariables)
    },

    filteredRuntimeVariables(): VariableItem[] {
      return this.filterVariables(this.runtimeVariables)
    },
  },

  watch: {
    variablePayload: {
      immediate: true,
      deep: true,
      handler() {
        this.syncDraftsFromStore()
      },
    },
  },

  methods: {
    filterVariables(variables: VariableItem[]): VariableItem[] {
      const query = String(this.searchQuery ?? '').trim().toLowerCase()
      if (!query) return variables

      return variables.filter(variable =>
        variable.key.toLowerCase().includes(query) ||
        this.valueToInput(variable.value).toLowerCase().includes(query)
      )
    },

    syncDraftsFromStore(force = false) {
      const nextDraftValues: Record<string, string> = {}

      for (const variable of this.variableList) {
        nextDraftValues[variable.key] = force
          ? this.valueToInput(variable.value)
          : this.draftValues[variable.key] ?? this.valueToInput(variable.value)
      }

      this.draftValues = nextDraftValues
    },

    saveVariable(variable: VariableItem) {
      if (!variable.key) return

      const value = this.inputToValue(
        this.draftValues[variable.key] ?? this.valueToInput(variable.value)
      )

      const store = useAppStore()

      store.setVariables({
        values: {
          ...this.variableValues,
          [variable.key]: value,
        },
        persistent_keys: [...this.persistentKeys],
      })

      this.draftValues[variable.key] = this.valueToInput(value)
    },

    deleteVariable(variable: VariableItem) {
      if (!variable.key) return

      const values = { ...this.variableValues }
      delete values[variable.key]

      const store = useAppStore()
      store.setVariables({
        values,
        persistent_keys: [...this.persistentKeys].filter(key => key !== variable.key),
      })

      delete this.draftValues[variable.key]
    },

    valueToInput(value: any): string {
      if (typeof value === 'string') return value
      return JSON.stringify(value, null, 2)
    },

    inputToValue(value: string): any {
      const trimmed = String(value ?? '').trim()
      if (trimmed === '') return ''

      try {
        return JSON.parse(trimmed)
      } catch {
        return value
      }
    },
  },
}
</script>

<style scoped>
.variables-list {
  max-height: min(42vh, 520px);
  overflow-y: auto;
}

.variables-list__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: min(520px, 60vw);
}

.variables-list__input {
  min-width: 280px;
}

.min-width-0 {
  min-width: 0;
}
</style>

<template>
  <v-expansion-panel :value="panelValue">
    <MacroTaskTitle
      :icon="icon"
      :index="index"
      :title="title"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @move-up="$emit('move-up')"
      @move-down="$emit('move-down')"
    />

    <v-expansion-panel-text>
      <v-combobox
        v-if="isObsTask"
        v-model="obsConnection"
        class="mb-4"
        :items="obsConnectionOptions"
        :label="$t('macro.obs.fields.connection')"
        prepend-inner-icon="mdi-connection"
        variant="outlined"
        density="comfortable"
        hide-details
        auto-select-first
      />

      <slot />

      <MacroTaskActions
        class="mt-2"
        :task="item.task"
        :filename="`${exportPrefix}_${index + 1}.yaml`"
        @remove="$emit('remove')"
      />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskTitle from './MacroTaskTitle.vue'
import MacroTaskActions from './MacroTaskActions.vue'

function normalizeObsConnectionName(value: any): string {
  const name = String(value ?? '')
    .replace(/^obs\\s*/i, '')
    .trim()

  return name || 'default'
}

export default {
  name: 'MacroTaskAccordionTemplate',

  components: {
    MacroTaskTitle,
    MacroTaskActions,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    exportPrefix: { type: String, default: 'macro_task' },
    panelValue: { type: [String, Number], default: undefined },
    canMoveUp: { type: Boolean, default: true },
    canMoveDown: { type: Boolean, default: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  setup() {
    const appStore = useAppStore()
    return { appStore }
  },

  computed: {
    task(): any {
      return (this.item as any)?.task ?? {}
    },

    isObsTask(): boolean {
      return String(this.task?.channel ?? '').toLowerCase() === 'obs'
    },

    obsConnection: {
      get(): string {
        if (!this.isObsTask) return 'default'

        this.task.data = this.task.data && typeof this.task.data === 'object'
          ? this.task.data
          : {}

        return String(this.task.data.connection ?? 'default')
      },

      set(value: string | null) {
        if (!this.isObsTask) return

        this.task.data = this.task.data && typeof this.task.data === 'object'
          ? this.task.data
          : {}

        const connection = String(value ?? '').trim() || 'default'

        if (connection === 'default') {
          delete this.task.data.connection
          return
        }

        this.task.data.connection = connection
      },
    },

    obsConnectionOptions(): string[] {
      const names = new Set<string>(['default'])

      const integrations: any =
        this.appStore.getIntegrations
        ?? this.appStore.integrations
        ?? {}

      const obsIntegrations = integrations?.obs

      if (
        obsIntegrations
        && typeof obsIntegrations === 'object'
        && !Array.isArray(obsIntegrations)
      ) {
        for (const [rawName, config] of Object.entries(obsIntegrations)) {
          if (!config || typeof config !== 'object') continue
          if (!(config as any).ip) continue

          names.add(normalizeObsConnectionName(rawName))
        }
      }

      const parsedConfig: any =
        this.appStore.getParsedBackendConfig
        ?? this.appStore.parsedBackendConfig
        ?? {}

      if (
        parsedConfig
        && typeof parsedConfig === 'object'
        && !Array.isArray(parsedConfig)
      ) {
        for (const [rawName, config] of Object.entries(parsedConfig)) {
          if (!/^obs(?:\\s|$)/i.test(rawName)) continue

          if (Array.isArray(config)) {
            config.forEach((entry: any, index: number) => {
              if (!entry?.ip) return
              names.add(index === 0 ? 'default' : `obs_${index + 1}`)
            })
            continue
          }

          if (config && typeof config === 'object' && (config as any).ip) {
            names.add(normalizeObsConnectionName(rawName))
          }
        }
      }

      return [...names].sort((a, b) => {
        if (a === 'default') return -1
        if (b === 'default') return 1
        return a.localeCompare(b)
      })
    },
  },
}
</script>

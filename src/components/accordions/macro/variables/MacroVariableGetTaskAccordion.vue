<template>
  <MacroTaskAccordionTemplate
    class="macro-variable-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-database-import-outline"
    :title="$t('macro.variable.getTitle')"
    :detail="variableData.key || ''"
    export-prefix="macro_variable_get"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-combobox
      v-model="variableData.key"
      :items="variableOptions"
      :label="$t('macro.final.variableGet.variableKey')"
      density="comfortable"
      variant="outlined"
      hide-details
      clearable
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroVariableGetTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      const task = (this.item as any).task

      task.channel = 'variable'
      task.method = 'get'
      task.data ??= {}

      return task
    },

    variableData(): any {
      return this.task.data
    },

    variableOptions(): string[] {
      const variables = useAppStore().getVariables ?? {}

      if (Array.isArray(variables)) return variables.map(String).filter(Boolean).sort()

      if (variables && typeof variables === 'object') {
        const persistentKeys = Array.isArray((variables as any).persistent_keys)
          ? (variables as any).persistent_keys
          : []
        const valueKeys = (variables as any).values && typeof (variables as any).values === 'object'
          ? Object.keys((variables as any).values)
          : []
        const directKeys = Object.keys(variables).filter(key => !['persistent_keys', 'values'].includes(key))
        return [...new Set([...persistentKeys, ...valueKeys, ...directKeys].map(String).filter(Boolean))].sort()
      }

      return []
    },
  },
}
</script>

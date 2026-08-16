<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-variable-box"
    :title="$t('macro.core.variableLocalSet.title')"
    export-prefix="macro_variable_local_set"
    :can-move-up="canMoveUp"
    :can-move-down="canMoveDown"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="variableData.key"
          :label="$t('macro.core.variableLocalSet.key')"
          :placeholder="$t('macro.core.variableLocalSet.keyPlaceholder')"
          density="comfortable"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-text-field
          v-model="variableData.expression"
          :label="$t('macro.core.variableLocalSet.expression')"
          :placeholder="$t('macro.core.variableLocalSet.expressionPlaceholder')"
          :hint="$t('macro.core.variableLocalSet.expressionHint')"
          persistent-hint
          density="comfortable"
          variant="outlined"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroVariableLocalSetTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    canMoveUp: { type: Boolean, default: true },
    canMoveDown: { type: Boolean, default: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    variableData(): any {
      const task = (this.item as any).task

      task.channel = 'variable'
      task.method = 'local_set'
      task.data = task.data && typeof task.data === 'object' && !Array.isArray(task.data)
        ? task.data
        : {}

      task.data.key ??= ''
      task.data.expression ??= ''

      return task.data
    },
  },
}
</script>

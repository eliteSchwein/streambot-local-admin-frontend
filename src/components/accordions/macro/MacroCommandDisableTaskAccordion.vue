<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-toggle-switch-off-outline"
    :title="$t('macro.command.disable.title')"
    export-prefix="macro_command_disable"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroCommandSelect v-model="task.data.name" />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'
import MacroCommandSelect from './MacroCommandSelect.vue'

export default {
  name: 'MacroCommandDisableTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroCommandSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'command'
      task.method = 'disable'
      task.data ??= {}
      task.data.name ??= ''

      return task
    },
  },

  created() {
    this.task
  },
}
</script>

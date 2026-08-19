<template>
  <MacroTaskAccordionTemplate
    class="macro-command-toggle-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-console-line"
    :title="$t('macro.core.commandToggle.title')"
    export-prefix="macro_command_toggle"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-select
      v-model="task.method"
      :items="actionOptions"
      :label="$t('macro.core.commandToggle.action')"
      variant="outlined"
      density="comfortable"
      hide-details
      class="mb-3"
    />

    <v-select
      v-model="task.data.name"
      :items="commandOptions"
      :label="$t('macro.core.commandToggle.command')"
      variant="outlined"
      density="comfortable"
      hide-details
      clearable
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroCommandToggleTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    ...mapState(useAppStore, ['getCommands']),

    task(): any {
      const task = (this.item as any).task
      task.channel = 'command'

      if (!['enable', 'disable', 'toggle'].includes(task.method)) {
        task.method = 'toggle'
      }

      task.data ??= {}
      task.data.name ??= ''

      return task
    },

    actionOptions() {
      return [
        { title: this.$t('macro.core.commandToggle.enable'), value: 'enable' },
        { title: this.$t('macro.core.commandToggle.disable'), value: 'disable' },
        { title: this.$t('macro.core.commandToggle.toggle'), value: 'toggle' },
      ]
    },

    commandOptions() {
      const commands = this.getCommands ?? {}

      return Object.keys(commands)
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({
          title: `!${name}`,
          value: name,
        }))
    },
  },

  created() {
    this.task
  },
}
</script>

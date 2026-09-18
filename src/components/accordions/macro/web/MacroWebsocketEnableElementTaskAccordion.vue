<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-eye-outline"
    :title="$t('macro.final.websocketVisibility.showElement')"
    :detail="task.data.target || ''"
    export-prefix="macro_show_element"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroWebsocketVisibilityTargetSelect v-model="task.data.target" />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import MacroWebsocketVisibilityTargetSelect from './MacroWebsocketVisibilityTargetSelect.vue'

export default {
  name: 'MacroWebsocketEnableElementTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroWebsocketVisibilityTargetSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'websocket'
      task.method = 'notify_toggle_element'
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      task.data.target ??= ''
      task.data.action = 'enable'
      return task
    },
  },

  created() {
    this.task
  },
}
</script>

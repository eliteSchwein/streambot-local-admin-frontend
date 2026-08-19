<template>
  <MacroTaskAccordionTemplate
    class="macro-channel-point-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-toggle-switch-off-outline"
    :title="$t('macro.core.channelPointToggle.disableReward')"
    export-prefix="macro_channel_point_disable"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroChannelPointSelect v-model="task.data.name" />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'
import MacroChannelPointSelect from './MacroChannelPointSelect.vue'

export default {
  name: 'MacroChannelPointDisableTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroChannelPointSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'channel_point'
      task.method = 'disable'
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      task.data.name ??= ''

      return task
    },
  },

  created() {
    this.task
  },
}
</script>

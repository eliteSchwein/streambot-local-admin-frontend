<template>
  <MacroTaskAccordionTemplate
    class="macro-channel-point-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-toggle-switch"
    :title="$t('macro.core.channelPointToggle.enableReward')"
    export-prefix="macro_channel_point_enable"
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
  name: 'MacroChannelPointEnableTaskAccordion',

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
      task.method = 'enable'
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

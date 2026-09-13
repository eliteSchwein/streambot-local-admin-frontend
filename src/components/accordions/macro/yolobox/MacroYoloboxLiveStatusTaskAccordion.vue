<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    :icon="task.data.status === 'start' ? 'mdi-play-circle-outline' : 'mdi-stop-circle-outline'"
    :title="task.data.status === 'start'
      ? $t('macro.presets.yolobox.streaming.goLive')
      : $t('macro.presets.yolobox.streaming.stopStream')"
    export-prefix="macro_yolobox_live_status"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroYoloboxLiveStatusTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],
  computed: {
    task(): any {
      return (this.item as any).task
    },
  },
  created() {
    this.task.channel = 'yolobox'
    this.task.method = 'order_live_status'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}
    this.task.data.status ??= 'start'
  },
}
</script>

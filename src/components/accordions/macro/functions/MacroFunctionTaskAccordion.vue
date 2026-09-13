<template>
  <component
    :is="componentName"
    :item="item"
    :index="index"
    :depth="depth"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  />
</template>

<script lang="ts">
import MacroTaskAccordion from '@/components/accordions/macro/MacroTaskAccordion.vue'
import MacroFunctionRandomTaskAccordion from './MacroFunctionRandomTaskAccordion.vue'
import MacroFunctionSendDmTaskAccordion from './MacroFunctionSendDmTaskAccordion.vue'
import MacroFunctionSendMessageTaskAccordion from './MacroFunctionSendMessageTaskAccordion.vue'
import MacroFunctionSleepTaskAccordion from './MacroFunctionSleepTaskAccordion.vue'
import MacroFunctionSongRequestTaskAccordion from './MacroFunctionSongRequestTaskAccordion.vue'
import MacroFunctionSongRequestToggleTaskAccordion from './MacroFunctionSongRequestToggleTaskAccordion.vue'
import MacroFunctionSpeakTaskAccordion from './MacroFunctionSpeakTaskAccordion.vue'
import MacroFunctionAnnounceTaskAccordion from './MacroFunctionAnnounceTaskAccordion.vue'

export default {
  name: 'MacroFunctionTaskAccordion',

  components: {
    MacroFunctionAnnounceTaskAccordion,
    MacroFunctionRandomTaskAccordion,
    MacroFunctionSleepTaskAccordion,
    MacroFunctionSpeakTaskAccordion,
    MacroFunctionSongRequestTaskAccordion,
    MacroFunctionSongRequestToggleTaskAccordion,
    MacroFunctionSendMessageTaskAccordion,
    MacroFunctionSendDmTaskAccordion,
    MacroTaskAccordion,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    componentName(): string {
      const method = (this.item as any)?.task?.method

      const componentsByMethod: Record<string, string> = {
        random: 'MacroFunctionRandomTaskAccordion',
        sleep: 'MacroFunctionSleepTaskAccordion',
        speak: 'MacroFunctionSpeakTaskAccordion',
        song_request: 'MacroFunctionSongRequestTaskAccordion',
        song_request_toggle: 'MacroFunctionSongRequestToggleTaskAccordion',
        send_message: 'MacroFunctionSendMessageTaskAccordion',
        send_dm: 'MacroFunctionSendDmTaskAccordion',
        announce: 'MacroFunctionAnnounceTaskAccordion',
      }

      return componentsByMethod[method] ?? 'MacroTaskAccordion'
    },
  },
}
</script>

<template>
  <MacroTaskAccordionTemplate
    class="macro-wled-custom-task-accordion"
    :item="item"
    :index="index"
    :depth="depth"
    icon="mdi-led-strip-variant"
    :title="$t('macro.presets.lights.wled')"
    :detail="titleDetail"
    export-prefix="macro_wled_custom"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroWledControlEditor
      v-model="task.data"
      @remove="$emit('remove')"
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import MacroWledControlEditor from '@/components/MacroWledControlEditor.vue'

export default {
  name: 'MacroWledCustomTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroWledControlEditor,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    titleDetail(): string {
      const data = this.task.data ?? {}
      const name = String(data.name ?? '').trim()
      if (!name) return ''

      const preset = data.preset
      if (preset !== null && preset !== undefined && String(preset).trim() !== '') {
        return `${name} · ${String(this.$t('assets.preset'))} ${preset}`
      }

      const effect = data.effect
      if (effect !== null && effect !== undefined && String(effect).trim() !== '') {
        return `${name} · ${String(this.$t('assets.effect'))} ${effect}`
      }

      return name
    },

    task(): any {
      const task = (this.item as any).task

      task.channel = 'wled'
      task.method = 'custom'
      task.data ??= {}

      return task
    },
  },
}
</script>

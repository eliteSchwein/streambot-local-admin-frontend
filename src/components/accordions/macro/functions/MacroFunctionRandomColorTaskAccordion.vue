<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.presets.randomColor')"
    :title-detail="titleDetail"
    icon="mdi-palette-outline"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12">
        <v-text-field
          v-model="data.key"
          :label="$t('macro.function.fields.variableKey')"
          :placeholder="$t('macro.function.randomColor.variablePlaceholder')"
          :hint="$t('macro.function.randomColor.hint')"
          density="compact"
          variant="outlined"
          persistent-hint
        />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'

export default {
  name: 'MacroFunctionRandomColorTaskAccordion',

  components: {
    MacroFunctionBaseTaskAccordion,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    data(): any {
      const task = (this.item as any).task
      if (!task.data || typeof task.data !== 'object') task.data = {}
      return task.data
    },

    titleDetail(): string {
      return String(this.data.key ?? '').trim()
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'function'
    task.method = 'random_color'
    if (!task.data || typeof task.data !== 'object') task.data = {}
    task.data.key ??= 'random_color'
  },
}
</script>

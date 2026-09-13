<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.presets.random')"
    :title-detail="titleDetail"
    icon="mdi-dice-multiple-outline"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12" md="4">
        <v-text-field v-model="data.key" :label="$t('macro.function.fields.variableKey')" density="compact" variant="outlined" hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model.number="data.min" :label="$t('macro.function.fields.min')" type="number" density="compact" variant="outlined" hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model.number="data.max" :label="$t('macro.function.fields.max')" type="number" density="compact" variant="outlined" hide-details />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'

export default {
  name: 'MacroFunctionRandomTaskAccordion',

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
      const key = String(this.data.key ?? '').trim()
      const hasMin = this.data.min !== undefined && this.data.min !== null && this.data.min !== ''
      const hasMax = this.data.max !== undefined && this.data.max !== null && this.data.max !== ''

      const range = hasMin || hasMax
        ? `${hasMin ? this.data.min : '?'}–${hasMax ? this.data.max : '?'}`
        : ''

      return [key, range].filter(Boolean).join(' · ')
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'function'
    task.method = 'random'
    if (!task.data || typeof task.data !== 'object') task.data = {}
  },
}
</script>

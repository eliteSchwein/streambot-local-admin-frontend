<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.function.parallel.title')"
    :title-detail="$t('macro.common.taskCount', { count: parallelItems.length })"
    icon="mdi-call-split"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default>
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
          :text="$t('macro.function.parallel.info')"
        />

        <component
          :is="taskListComponent"
          :items="parallelItems"
          :depth="depth + 1"
          :task-list-component="taskListComponent"
          :inside-loop="insideLoop"
          :inside-switch="insideSwitch"
          nested
        />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'
import { flattenMacroVisualTasks, parseMacroVisualTasks } from '@/helper/MacroVisualTaskHelper'

export default {
  name: 'MacroFunctionParallelTaskAccordion',

  components: {
    MacroFunctionBaseTaskAccordion,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
    taskListComponent: { type: [Object, Function, String], required: true },
    insideLoop: { type: Boolean, default: false },
    insideSwitch: { type: Boolean, default: false },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    parallelItems(): any[] {
      return (this.item as any).children ?? []
    },
  },

  created() {
    const item = this.item as any
    const task = item.task
    task.channel = 'function'
    task.method = 'parallel'
    if (!task.data || typeof task.data !== 'object') task.data = {}
    if (!Array.isArray(task.data.tasks)) task.data.tasks = []

    // Existing macros/presets may not have the visual children representation yet.
    // Parse the flat backend task sequence exactly once into the normal visual tree.
    if (!Array.isArray(item.children)) {
      item.children = parseMacroVisualTasks(task.data.tasks, () => this.uid())
    }
  },

  watch: {
    parallelItems: {
      deep: true,
      handler(items: any[]) {
        const task = (this.item as any).task
        task.data ??= {}
        task.data.tasks = flattenMacroVisualTasks(items)
      },
    },
  },

  methods: {
    uid() {
      return `${Date.now()}_${Math.random().toString(16).slice(2)}`
    },
  },
}
</script>

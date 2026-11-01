<template>
  <div class="d-flex justify-end ga-2 mt-2">
    <v-btn variant="text" prepend-icon="mdi-export" @click="exportTask">{{ $t('macro.final.taskActions.export') }}</v-btn>

    <v-btn variant="text" prepend-icon="mdi-import" @click="openImport">{{ $t('macro.final.taskActions.import') }}</v-btn>

    <input
      ref="fileInput"
      class="d-none"
      type="file"
      accept=".yaml,.yml,text/yaml,application/x-yaml,text/plain"
      @change="importTask"
    >

    <v-btn variant="text" color="error" @click="$emit('remove')">
      <v-icon icon="mdi-delete" />
    </v-btn>
  </div>
</template>

<script lang="ts">
import YAML from 'yaml'
import {
  flattenMacroVisualTasks,
  parseMacroVisualTasks,
  replaceVisualItem,
} from '@/helper/MacroVisualTaskHelper'

export default {
  name: 'MacroTaskActions',

  props: {
    item: { type: Object, required: true },
    filename: { type: String, default: 'macro_task.yaml' },
  },

  emits: ['remove', 'error'],

  methods: {
    isStructuralItem(): boolean {
      const item = this.item as any
      return item?.type === 'condition'
        || item?.type === 'loop'
        || item?.type === 'switch'
        || (item?.task?.channel === 'function' && item?.task?.method === 'parallel')
    },

    exportTask() {
      const item = this.item as any
      const payload = this.isStructuralItem()
        ? { tasks: flattenMacroVisualTasks([item]) }
        : item.task

      const yaml = YAML.stringify(payload, { lineWidth: 0 })
      const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = this.filename
      link.click()

      URL.revokeObjectURL(url)
    },

    openImport() {
      ;(this.$refs.fileInput as HTMLInputElement | undefined)?.click()
    },

    async importTask(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      try {
        const parsed = YAML.parse(await file.text())
        let tasks: any[]

        if (Array.isArray(parsed?.tasks)) {
          tasks = parsed.tasks
        } else if (parsed?.task && typeof parsed.task === 'object' && !Array.isArray(parsed.task)) {
          // Compatibility with an older wrapper format.
          tasks = [parsed.task]
        } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          // Compatibility with the old single-task export format.
          tasks = [parsed]
        } else {
          throw new Error('invalid macro task yaml')
        }

        const visualItems = parseMacroVisualTasks(tasks)
        if (visualItems.length !== 1) {
          throw new Error('macro task import must contain exactly one top-level task')
        }

        replaceVisualItem(this.item as any, visualItems[0])
      } catch (error: any) {
        this.$emit('error', error)
      } finally {
        input.value = ''
      }
    },
  },
}
</script>

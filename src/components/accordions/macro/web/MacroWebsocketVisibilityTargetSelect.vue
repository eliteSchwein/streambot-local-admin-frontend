<template>
  <v-combobox
    :model-value="modelValue"
    :items="targetOptions"
    :label="$t('macro.final.websocketVisibility.target')"
    :hint="$t('macro.final.websocketVisibility.targetHint')"
    persistent-hint
    clearable
    auto-select-first
    prepend-inner-icon="mdi-target"
    density="comfortable"
    variant="outlined"
    hide-details="auto"
    @update:model-value="updateValue"
  />
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'

function collectVisibilityTargets(value: any, targets: Set<string>, seen = new Set<any>()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)

  if (
    value?.channel === 'websocket'
    && value?.method === 'notify_toggle_element'
    && typeof value?.data?.target === 'string'
  ) {
    const target = value.data.target.trim()
    if (target) targets.add(target)
  }

  if (
    value?.task?.channel === 'websocket'
    && value?.task?.method === 'notify_toggle_element'
    && typeof value?.task?.data?.target === 'string'
  ) {
    const target = value.task.data.target.trim()
    if (target) targets.add(target)
  }

  if (Array.isArray(value)) {
    for (const entry of value) collectVisibilityTargets(entry, targets, seen)
    return
  }

  for (const entry of Object.values(value)) {
    collectVisibilityTargets(entry, targets, seen)
  }
}

export default {
  name: 'MacroWebsocketVisibilityTargetSelect',

  props: {
    modelValue: { type: String, default: '' },
  },

  emits: ['update:modelValue'],

  setup() {
    const appStore = useAppStore()
    return { appStore }
  },

  computed: {
    targetOptions(): string[] {
      // `camera` is the standard visibility target and keeps a useful suggestion
      // available even before the first visibility task has been saved.
      const targets = new Set<string>(['camera'])
      collectVisibilityTargets(this.appStore.getMacros ?? {}, targets)

      const current = String(this.modelValue ?? '').trim()
      if (current) targets.add(current)

      return [...targets].sort((a, b) => {
        if (a === 'camera') return -1
        if (b === 'camera') return 1
        return a.localeCompare(b)
      })
    },
  },

  methods: {
    updateValue(value: any) {
      this.$emit('update:modelValue', String(value ?? '').trim())
    },
  },
}
</script>

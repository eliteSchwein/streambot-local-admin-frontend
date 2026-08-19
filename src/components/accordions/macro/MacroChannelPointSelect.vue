<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="channelPointOptions"
    :label="$t('macro.core.channelPointToggle.channelPointName')"
    prepend-inner-icon="mdi-star-circle"
    variant="outlined"
    density="comfortable"
    hide-details
    clearable
    auto-select-first
    hide-no-data
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'

export default {
  name: 'MacroChannelPointSelect',

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      appStore: useAppStore(),
    }
  },

  computed: {
    channelPointOptions(): string[] {
      const channelPoints = this.appStore.channelPoints ?? {
        active: [],
        all: [],
      }

      const active = Array.isArray(channelPoints.active)
        ? channelPoints.active
        : []

      const all = Array.isArray(channelPoints.all)
        ? channelPoints.all
        : []

      return [...new Set([...active, ...all]
        .map((point: any) =>
          point?.label ??
          point?.name ??
          point?.title ??
          point?.reward?.title ??
          point?.reward?.name,
        )
        .filter(Boolean)
        .map((value: any) => String(value).trim())
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
    },
  },
}
</script>

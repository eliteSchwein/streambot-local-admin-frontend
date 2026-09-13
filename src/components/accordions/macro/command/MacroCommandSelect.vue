<template>
  <v-select
    :model-value="modelValue"
    :items="commandOptions"
    :label="$t('macro.command.fields.command')"
    variant="outlined"
    density="comfortable"
    hide-details
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  name: 'MacroCommandSelect',

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  computed: {
    ...mapState(useAppStore, ['getCommands']),

    commandOptions() {
      return Object.keys(this.getCommands ?? {})
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({
          title: `!${name}`,
          value: name,
        }))
    },
  },
}
</script>

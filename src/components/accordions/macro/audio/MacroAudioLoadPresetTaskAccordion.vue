<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-tune-variant"
    :title="$t('macro.audio.loadPresetTitle')"
    export-prefix="macro_audio_load_preset"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-autocomplete
      v-model="task.data.name"
      :items="presetOptions"
      :label="$t('macro.audio.preset')"
      :placeholder="$t('macro.audio.presetPlaceholder')"
      prepend-inner-icon="mdi-tune-variant"
      variant="outlined"
      density="comfortable"
      clearable
      auto-select-first
      hide-no-data
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import { useAppStore } from '@/stores/app.ts'

export default {
  name: 'MacroAudioLoadPresetTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  setup() {
    const appStore = useAppStore()
    return { appStore }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    presetOptions(): string[] {
      return Object.keys(this.appStore.getAudioPresets ?? this.appStore.audioPresets ?? {})
        .sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.task.channel = 'audio'
    this.task.method = 'load_preset'
    this.task.data = this.task.data && typeof this.task.data === 'object'
      ? this.task.data
      : {}
    this.task.data.name ??= ''
  },
}
</script>

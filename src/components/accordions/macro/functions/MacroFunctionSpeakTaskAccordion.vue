<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :title-prefix="$t('macro.function.speak.title')"
    icon="mdi-account-voice"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="data.content"
          :label="$t('macro.function.fields.text')"
          density="compact"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="data.locale"
          :items="localeItems"
          :label="$t('macro.function.fields.locale')"
          density="compact"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-text-field
        class="d-none"
        v-model="data.event_uuid"
        :label="$t('macro.function.fields.eventId')"
        density="compact"
        variant="outlined"
        hide-details
      />
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'
import { useAppStore } from '@/stores/app'

export default {
  name: 'MacroFunctionSpeakTaskAccordion',

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
    localeItems(): Array<{ title: string, value: string }> {
      const settings: any = useAppStore().getSettings ?? {}
      const voices = settings?.tts?.voices ?? {}

      return Object.entries(voices)
        .filter(([locale, voice]) => Boolean(String(locale).trim()) && Boolean(String(voice).trim()))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([locale, voice]) => ({
          title: `${locale} · ${voice}`,
          value: locale,
        }))
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'function'
    task.method = 'speak'
    if (!task.data || typeof task.data !== 'object') task.data = {}
  },
}
</script>

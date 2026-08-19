<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-task-accordion--clear-media"
    :item="item"
    :index="index"
    icon="mdi-image-off-outline"
    :title="$t('macro.final.media.clearTitle')"
    export-prefix="macro_media_clear"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-combobox
          v-model="task.data.target"
          :items="mediaTargetOptions"
          :label="$t('macro.final.media.target')"
          :hint="$t('macro.final.media.clearTargetHint')"
          prepend-inner-icon="mdi-crosshairs-gps"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          clearable
          auto-select-first
        />
      </v-col>

      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
          :text="$t('macro.final.media.clearInfo')"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroClearMediaTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      appStore: useAppStore(),
    }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    mediaTargetOptions(): string[] {
      const dynamicData =
        this.appStore?.getDynamicData ??
        this.appStore?.dynamicData ??
        {}

      const targets = Array.isArray(dynamicData?.media_targets)
        ? dynamicData.media_targets
        : []

      const current = String(this.task.data?.target ?? '').trim()

      return [...new Set([
        ...targets
          .map((value: any) => String(value).trim())
          .filter(Boolean),
        ...(current ? [current] : []),
      ])].sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.task.channel = 'media'
    this.task.method = 'clear_media'

    if (!this.task.data || typeof this.task.data !== 'object') {
      this.task.data = {}
    }

    this.task.data.target ??= 'default'
  },
}
</script>

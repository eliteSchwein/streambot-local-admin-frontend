<template>
  <MacroTaskAccordionTemplate
    class="macro-obs-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-camera"
    :title="title"
    :export-prefix="isOutput ? 'macro_obs_output_screenshot' : 'macro_obs_source_screenshot'"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-combobox
      v-if="!isOutput"
      v-model="task.data.sourceName"
      :items="sourceSuggestions"
      :label="$t('macro.obs.fields.source')"
      density="comfortable"
      variant="outlined"
      clearable
      hide-details="auto"
      class="mb-3"
    />

    <v-text-field
      v-model="task.data.resultVariable"
      :label="$t('macro.obs.screenshot.resultVariable')"
      :hint="$t('macro.obs.screenshot.resultVariableHint')"
      persistent-hint
      density="comfortable"
      variant="outlined"
      class="mb-3"
    />

    <v-select
      v-model="task.data.imageFormat"
      :items="imageFormats"
      :label="$t('macro.obs.screenshot.format')"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      class="mb-3"
    />

    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="task.data.imageWidth"
          type="number"
          :label="$t('macro.obs.screenshot.width')"
          :min="1"
          density="comfortable"
          variant="outlined"
          clearable
          hide-details="auto"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="task.data.imageHeight"
          type="number"
          :label="$t('macro.obs.screenshot.height')"
          :min="1"
          density="comfortable"
          variant="outlined"
          clearable
          hide-details="auto"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-if="task.data.imageFormat === 'jpg' || task.data.imageFormat === 'jpeg'"
      v-model.number="task.data.imageCompressionQuality"
      type="number"
      :label="$t('macro.obs.screenshot.quality')"
      :min="-1"
      :max="100"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      class="mt-3"
    />

    <v-alert
      v-if="isOutput"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mt-3"
      :text="$t('macro.obs.outputScreenshot.info')"
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

function collectNamedValues(value: any, keys: Set<string>, result: Set<string>, seen = new Set<any>()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)

  if (Array.isArray(value)) {
    for (const entry of value) collectNamedValues(entry, keys, result, seen)
    return
  }

  for (const [key, entry] of Object.entries(value)) {
    if (keys.has(key) && typeof entry === 'string' && entry.trim()) {
      result.add(entry.trim())
    }

    collectNamedValues(entry, keys, result, seen)
  }
}

export default {
  name: 'MacroObsScreenshotTaskAccordion',

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
      imageFormats: ['png', 'jpg', 'jpeg', 'bmp'],
    }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    isOutput(): boolean {
      return this.task?.method === 'get_output_screenshot'
    },

    title(): string {
      return this.$t(this.isOutput
        ? 'macro.obs.outputScreenshot.title'
        : 'macro.obs.sourceScreenshot.title') as string
    },

    sourceSuggestions(): string[] {
      const values = new Set<string>()
      collectNamedValues(
        this.appStore.$state,
        new Set(['sourceName', 'inputName', 'sceneName']),
        values,
      )
      return [...values].sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.task.channel = 'obs'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}

    delete this.task.data.connection
    delete this.task.data.imageFilePath

    this.task.data.imageFormat ??= 'png'
    this.task.data.resultVariable ??= 'screenshot'

    if (!this.isOutput) {
      this.task.method = 'GetSourceScreenshot'
      this.task.data.sourceName ??= ''
    }
  },
}
</script>

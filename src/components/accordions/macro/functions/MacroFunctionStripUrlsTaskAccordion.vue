<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.function.stripUrls.title')"
    icon="mdi-link-off"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-2"
          :text="$t('macro.function.stripUrls.info')"
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-text-field
          v-model="data.content"
          :label="$t('macro.function.fields.text')"
          :hint="$t('macro.function.stripUrls.contentHint')"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="data.key"
          :label="$t('macro.function.fields.variableKey')"
          :hint="$t('macro.function.stripUrls.variableHint')"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'

export default {
  name: 'MacroFunctionStripUrlsTaskAccordion',

  components: {
    MacroFunctionBaseTaskAccordion,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  created() {
    const task = (this.item as any).task

    task.channel = 'function'
    task.method = 'strip_urls'

    if (!task.data || typeof task.data !== 'object') {
      task.data = {}
    }

    task.data.content ??= ''
    task.data.key ??= 'stripped_url_text'
  },
}
</script>

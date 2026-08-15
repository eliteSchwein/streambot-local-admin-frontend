<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :title-prefix="$t('macro.function.stripEmojis.title')"
    icon="mdi-emoticon-remove-outline"
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
          :text="$t('macro.function.stripEmojis.info')"
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-text-field
          v-model="data.content"
          :label="$t('macro.function.fields.text')"
          :hint="$t('macro.function.stripEmojis.contentHint')"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="data.key"
          :label="$t('macro.function.fields.variableKey')"
          :hint="$t('macro.function.stripEmojis.variableHint')"
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
  name: 'MacroFunctionStripEmojisTaskAccordion',

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
    task.method = 'strip_emojis'

    if (!task.data || typeof task.data !== 'object') {
      task.data = {}
    }

    task.data.content ??= ''
    task.data.key ??= 'stripped_text'
  },
}
</script>

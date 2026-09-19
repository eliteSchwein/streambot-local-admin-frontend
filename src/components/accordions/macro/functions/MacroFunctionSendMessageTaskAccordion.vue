<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.function.sendMessage.title')"
    :title-detail="titleDetail"
    icon="mdi-message-text-outline"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12" md="8">
        <v-text-field v-model="data.content" :label="$t('macro.function.fields.message')" density="compact" variant="outlined" hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <MacroFunctionAccountSelect v-model="data.account" />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'
import MacroFunctionAccountSelect from './MacroFunctionAccountSelect.vue'

export default {
  name: 'MacroFunctionSendMessageTaskAccordion',

  components: {
    MacroFunctionBaseTaskAccordion,
    MacroFunctionAccountSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    titleDetail(): string {
      return this.preview(String(this.taskData.content ?? ''))
    },

    taskData(): any {
      return (this.item as any).task?.data ?? {}
    },
  },

  methods: {
    preview(value: string): string {
      const normalized = value.replace(/\s+/g, ' ').trim()
      return normalized.length > 64 ? `${normalized.slice(0, 61)}…` : normalized
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'function'
    task.method = 'send_message'
    if (!task.data || typeof task.data !== 'object') task.data = {}

    const account = String(task.data.account ?? '').trim().toLowerCase()
    task.data.account = account === 'streamer' || account === 'control' ? 'streamer' : 'message'
  },
}
</script>

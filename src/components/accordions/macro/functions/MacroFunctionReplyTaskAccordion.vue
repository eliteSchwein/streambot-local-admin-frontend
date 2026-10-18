<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :custom-title="$t('macro.function.reply.title')"
    :title-detail="titleDetail"
    icon="mdi-reply-outline"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default="{ data }">
      <v-col cols="12">
        <v-text-field
          v-model="data.content"
          :label="$t('macro.function.fields.message')"
          density="compact"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="data.message_id"
          :label="$t('macro.function.fields.messageId')"
          :placeholder="$t('macro.function.reply.messageIdPlaceholder')"
          :hint="$t('macro.function.reply.messageIdHint')"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <MacroFunctionAccountSelect v-model="data.account" />
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'
import MacroFunctionAccountSelect from './MacroFunctionAccountSelect.vue'

export default {
  name: 'MacroFunctionReplyTaskAccordion',

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
    task.method = 'reply'
    if (!task.data || typeof task.data !== 'object') task.data = {}

    task.data.content = String(task.data.content ?? '')
    task.data.message_id = String(task.data.message_id ?? task.data.messageId ?? '')
    task.data.account = String(task.data.account ?? 'message').toLowerCase()
    if (task.data.account === 'streamer') task.data.account = 'control'
    if (task.data.account !== 'control') task.data.account = 'message'
    delete task.data.messageId
    delete task.data.channel_id
    delete task.data.channelId
  },
}
</script>

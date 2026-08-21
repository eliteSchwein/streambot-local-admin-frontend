<template>
  <MacroTaskAccordionTemplate
    class="macro-ollama-chat-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-chat-processing-outline"
    :title="$t('macro.core.ollamaChat.title')"
    export-prefix="macro_ollama_chat"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
      :text="$t('macro.core.ollamaChat.description')"
    />

    <v-row density="comfortable">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-2">
            {{ $t('macro.core.ollamaChat.messages') }}
          </div>

          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus"
            @click.stop="addMessage"
          >
            {{ $t('macro.core.ollamaChat.addMessage') }}
          </v-btn>
        </div>

        <v-expansion-panels
          v-model="openMessages"
          multiple
          variant="accordion"
        >
          <v-expansion-panel
            v-for="(_, messageIndex) in task.data.messages"
            :key="messageIndex"
            :value="messageIndex"
          >
            <v-expansion-panel-title color="surface-light">
              <div class="d-flex align-center ga-3 w-100">
                <v-chip
                  size="small"
                  variant="tonal"
                >
                  {{ roleTitle(task.data.messages[messageIndex].role) }}
                </v-chip>

                <div class="text-body-2 text-truncate flex-grow-1">
                  {{ messageTitle(task.data.messages[messageIndex]) }}
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-select
                v-model="task.data.messages[messageIndex].role"
                :items="roleItems"
                item-title="title"
                item-value="value"
                :label="$t('macro.core.ollamaChat.role')"
                density="comfortable"
                variant="outlined"
                class="mb-3"
                hide-details
              />

              <div class="text-caption text-medium-emphasis mb-3">
                {{ roleDescription(task.data.messages[messageIndex].role) }}
              </div>

              <v-textarea
                v-model="task.data.messages[messageIndex].content"
                :label="$t('macro.core.ollamaChat.content')"
                density="comfortable"
                variant="outlined"
                rows="5"
                auto-grow
                hide-details
                @keydown.stop
              />

              <div class="d-flex justify-end mt-4">
                <v-btn
                  prepend-icon="mdi-delete-outline"
                  variant="tonal"
                  color="error"
                  :disabled="task.data.messages.length <= 1"
                  @click="removeMessage(messageIndex)"
                >
                  {{ $t('macro.core.ollamaChat.deleteMessage') }}
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="task.data.result_variable"
          :label="$t('macro.core.ollamaChat.resultVariable')"
          :hint="$t('macro.core.ollamaChat.resultVariableHint')"
          persistent-hint
          density="comfortable"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="task.data.timeout"
          type="number"
          min="0"
          :label="$t('macro.core.ollamaChat.timeout')"
          :hint="$t('macro.core.ollamaChat.timeoutHint')"
          persistent-hint
          density="comfortable"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12">
        <v-switch
          v-model="task.data.strip_emojis"
          :label="$t('macro.core.ollamaChat.stripEmojis')"
          :hint="$t('macro.core.ollamaChat.stripEmojisHint')"
          persistent-hint
          color="primary"
          density="comfortable"
          hide-details="auto"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroOllamaChatTaskAccordion',

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
      openMessages: [] as number[],
    }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    roleItems(): Array<{ title: string; value: string }> {
      return [
        {
          title: this.$t('macro.core.ollamaChat.roles.system'),
          value: 'system',
        },
        {
          title: this.$t('macro.core.ollamaChat.roles.user'),
          value: 'user',
        },
        {
          title: this.$t('macro.core.ollamaChat.roles.assistant'),
          value: 'assistant',
        },
        {
          title: this.$t('macro.core.ollamaChat.roles.tool'),
          value: 'tool',
        },
      ]
    },
  },

  created() {
    this.task.channel = 'ollama'
    this.task.method = 'chat'
    this.task.data = this.task.data && typeof this.task.data === 'object'
      ? this.task.data
      : {}

    this.task.data.messages = Array.isArray(this.task.data.messages)
      ? this.task.data.messages
      : []

    if (this.task.data.messages.length === 0) {
      this.task.data.messages.push({
        role: 'user',
        content: '',
      })
    }

    this.task.data.result_variable ??= 'ollama_response'
    this.task.data.timeout ??= 0
    this.task.data.strip_emojis ??= false
  },

  methods: {
    roleTitle(role: string) {
      return this.roleItems.find(item => item.value === role)?.title ?? role
    },

    messageTitle(message: any) {
      const role = this.roleTitle(message?.role)
      const normalized = String(message?.content ?? '').replace(/\s+/g, ' ').trim()
      const preview = normalized.length > 40
        ? `${normalized.slice(0, 40).trim()}…`
        : normalized

      return preview ? `${role}: ${preview}` : role
    },

    roleDescription(role: string) {
      switch (role) {
        case 'system':
          return this.$t('macro.core.ollamaChat.roleDescriptions.system')
        case 'user':
          return this.$t('macro.core.ollamaChat.roleDescriptions.user')
        case 'assistant':
          return this.$t('macro.core.ollamaChat.roleDescriptions.assistant')
        case 'tool':
          return this.$t('macro.core.ollamaChat.roleDescriptions.tool')
        default:
          return ''
      }
    },

    addMessage() {
      this.task.data.messages.push({
        role: 'user',
        content: '',
      })

      this.openMessages = [
        ...this.openMessages,
        this.task.data.messages.length - 1,
      ]
    },

    removeMessage(index: number) {
      if (this.task.data.messages.length <= 1) return
      this.task.data.messages.splice(index, 1)
    },
  },
}
</script>

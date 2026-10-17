<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    :icon="icon"
    :title="title"
    :detail="detail"
    export-prefix="macro_twitch_chat_settings"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row v-if="method === 'enable_slow_chat'">
      <v-col cols="12">
        <v-number-input
          v-model="task.data.delay"
          :min="3"
          :max="120"
          :step="1"
          variant="outlined"
          :label="$t('macro.twitch.chat.slowDelay')"
          :hint="$t('macro.twitch.chat.slowDelayHint')"
          persistent-hint
        />
      </v-col>
    </v-row>

    <v-row v-else-if="method === 'emote_only' || method === 'subscribers_only' || method === 'unique_chat'">
      <v-col cols="12">
        <v-switch
          v-model="task.data.enabled"
          color="primary"
          inset
          hide-details
          :label="$t('macro.twitch.chat.enabled')"
        />
      </v-col>
    </v-row>

    <v-row v-else-if="method === 'followers_only'">
      <v-col cols="12" md="6">
        <v-switch
          v-model="task.data.enabled"
          color="primary"
          inset
          hide-details
          :label="$t('macro.twitch.chat.enabled')"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-number-input
          v-model="task.data.delay"
          :min="0"
          :step="1"
          variant="outlined"
          :disabled="!task.data.enabled"
          :label="$t('macro.twitch.chat.followersDelay')"
          :hint="$t('macro.twitch.chat.followersDelayHint')"
          persistent-hint
        />
      </v-col>
    </v-row>


    <v-alert
      v-else-if="method === 'disable_slow_chat' || method === 'clear_chat'"
      type="info"
      variant="tonal"
      density="compact"
      :text="method === 'clear_chat' ? $t('macro.twitch.chat.clearChatHint') : $t('macro.twitch.chat.disableSlowChatHint')"
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroTwitchChatSettingsTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any { return (this.item as any).task },
    method(): string { return String(this.task?.method ?? '') },
    title(): string { return String(this.$t(`macro.twitch.chat.methods.${this.method}`)) },
    icon(): string {
      const icons: Record<string, string> = {
        enable_slow_chat: 'mdi-timer-play-outline',
        disable_slow_chat: 'mdi-timer-off-outline',
        clear_chat: 'mdi-broom',
        emote_only: 'mdi-emoticon-outline',
        followers_only: 'mdi-account-heart-outline',
        subscribers_only: 'mdi-account-star-outline',
        unique_chat: 'mdi-message-bulleted-off',
      }
      return icons[this.method] ?? 'mdi-chat-processing-outline'
    },
    detail(): string {
      if (this.method === 'enable_slow_chat') return `${Number(this.task.data?.delay ?? 3)}s`
      if (['emote_only', 'followers_only', 'subscribers_only', 'unique_chat'].includes(this.method)) {
        return String(this.task.data?.enabled ? this.$t('common.enabled') : this.$t('common.disabled'))
      }
      return ''
    },
  },

  created() {
    this.task.channel = 'twitch'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}

    if (this.method === 'enable_slow_chat') {
      this.task.data.delay ??= 3
    } else if (['emote_only', 'followers_only', 'subscribers_only', 'unique_chat'].includes(this.method)) {
      this.task.data.enabled ??= true
      if (this.method === 'followers_only') this.task.data.delay ??= 0
    }
  },

}
</script>

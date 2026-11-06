<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-account-search"
    :title="$t('macro.presets.twitch.userInfo')"
    :detail="detail"
    export-prefix="macro_twitch_user_info"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" density="compact" :text="$t('macro.twitch.userInfo.info')" />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="task.data.user"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          prepend-inner-icon="mdi-account"
          :label="$t('macro.twitch.userInfo.user')"
          :hint="$t('macro.twitch.userInfo.userHint')"
          persistent-hint
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="task.data.variable"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          prepend-inner-icon="mdi-variable"
          :label="$t('macro.twitch.userInfo.variable')"
          :hint="$t('macro.twitch.userInfo.variableHint')"
          persistent-hint
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroTwitchUserInfoTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },
  emits: ['remove', 'move-up', 'move-down'],
  computed: {
    task(): any { return (this.item as any).task },
    detail(): string {
      const user = String(this.task.data?.user ?? '').trim()
      const variable = String(this.task.data?.variable ?? '').trim()
      return [user, variable && `→ \${${variable}}`].filter(Boolean).join(' ')
    },
  },
  created() {
    this.task.channel = 'twitch'
    this.task.method = 'user_info'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}
    this.task.data.user ??= ''
    this.task.data.variable ??= 'twitch_user'
  },
}
</script>

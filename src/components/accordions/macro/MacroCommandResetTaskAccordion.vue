<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-backup-restore"
    :title="$t('macro.command.reset.title')"
    export-prefix="macro_command_reset"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroCommandSelect
      v-model="task.data.name"
      class="mb-3"
    />

    <v-select
      v-model="task.data.setting"
      :items="settingOptions"
      :label="$t('macro.command.fields.setting')"
      variant="outlined"
      density="comfortable"
      hide-details
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'
import MacroCommandSelect from './MacroCommandSelect.vue'

export default {
  name: 'MacroCommandResetTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroCommandSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'command'
      task.method = 'reset'
      task.data ??= {}
      task.data.name ??= ''
      task.data.setting ??= 'enabled'

      return task
    },

    settingOptions() {
      return [
        { title: this.$t('dialogs.commandCreateDialog.enabled'), value: 'enabled' },
        { title: this.$t('dialogs.commandCreateDialog.aliases'), value: 'aliases' },
        { title: this.$t('dialogs.commandCreateDialog.params'), value: 'params' },
        { title: this.$t('dialogs.commandCreateDialog.userCooldown'), value: 'userCooldown' },
        { title: this.$t('dialogs.commandCreateDialog.globalCooldown'), value: 'globalCooldown' },
        { title: this.$t('dialogs.commandCreateDialog.singleUse'), value: 'single_use' },
        { title: this.$t('dialogs.commandCreateDialog.userListMode'), value: 'user_list_mode' },
        { title: this.$t('dialogs.commandCreateDialog.users'), value: 'users' },
        { title: this.$t('dialogs.commandCreateDialog.primaryOnly'), value: 'enforce_primary' },
        { title: this.$t('dialogs.commandCreateDialog.broadcaster'), value: 'requiresBroadcaster' },
        { title: this.$t('dialogs.commandCreateDialog.mod'), value: 'requiresMod' },
        { title: this.$t('dialogs.commandCreateDialog.vip'), value: 'requiresVip' },
        { title: this.$t('dialogs.commandCreateDialog.asset'), value: 'asset' },
        { title: this.$t('dialogs.commandCreateDialog.macro'), value: 'macro' },
      ]
    },
  },

  created() {
    this.task
  },
}
</script>

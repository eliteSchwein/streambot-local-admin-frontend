<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-tune-variant"
    :title="$t('macro.command.set.title')"
    export-prefix="macro_command_set"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <MacroCommandSelect
      v-model="task.data.name"
      class="mb-4"
    />

    <v-row density="comfortable">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-2">
            {{ $t('macro.command.set.settingsTitle') }}
          </div>

          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                :disabled="availableSettingOptions.length === 0"
                @click.stop
              >
                {{ $t('macro.command.set.addSetting') }}
              </v-btn>
            </template>

            <v-list density="comfortable">
              <v-list-item
                v-for="option in availableSettingOptions"
                :key="option.value"
                :title="option.title"
                @click="addSetting(option.value)"
              />
            </v-list>
          </v-menu>
        </div>

        <v-alert
          v-if="settingEntries.length === 0"
          type="info"
          variant="tonal"
          density="comfortable"
          :text="$t('macro.command.set.noSettings')"
        />

        <v-expansion-panels
          v-else
          v-model="openSettings"
          multiple
          variant="accordion"
        >
          <v-expansion-panel
            v-for="entry in settingEntries"
            :key="entry.key"
            :value="entry.key"
          >
            <v-expansion-panel-title color="surface-light">
              <div class="d-flex align-center ga-3 w-100">
                <v-chip
                  size="small"
                  variant="tonal"
                >
                  {{ settingTitle(entry.key) }}
                </v-chip>

                <div class="text-body-2 text-truncate flex-grow-1">
                  {{ settingPreview(entry.key, entry.value) }}
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-select
                v-if="entry.key === 'single_use'"
                v-model="task.data.settings[entry.key]"
                :items="singleUseOptions"
                :label="$t('dialogs.commandCreateDialog.singleUse')"
                variant="outlined"
                density="comfortable"
                hide-details
              />

              <v-select
                v-else-if="entry.key === 'user_list_mode'"
                v-model="task.data.settings[entry.key]"
                :items="userListModeOptions"
                :label="$t('dialogs.commandCreateDialog.userListMode')"
                variant="outlined"
                density="comfortable"
                hide-details
              />

              <v-combobox
                v-else-if="entry.key === 'users'"
                v-model="task.data.settings[entry.key]"
                :label="$t('dialogs.commandCreateDialog.users')"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                hide-details
              />

              <v-text-field
                v-else-if="entry.key === 'userCooldown' || entry.key === 'globalCooldown'"
                v-model.number="task.data.settings[entry.key]"
                :label="settingTitle(entry.key)"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hide-details
              />

              <v-switch
                v-else
                v-model="task.data.settings[entry.key]"
                :label="settingTitle(entry.key)"
                color="primary"
                density="comfortable"
                hide-details
              />

              <div class="d-flex justify-end mt-4">
                <v-btn
                  prepend-icon="mdi-delete-outline"
                  variant="tonal"
                  color="error"
                  @click="removeSetting(entry.key)"
                >
                  {{ $t('macro.command.set.removeSetting') }}
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'
import MacroCommandSelect from './MacroCommandSelect.vue'

export default {
  name: 'MacroCommandSetTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    MacroCommandSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      openSettings: [] as string[],
    }
  },

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'command'
      task.method = 'set'
      task.data ??= {}
      task.data.name ??= ''

      if (!task.data.settings || typeof task.data.settings !== 'object' || Array.isArray(task.data.settings)) {
        task.data.settings = {}

        if (task.data.setting) {
          task.data.settings[task.data.setting] = task.data.value
        }
      }

      delete task.data.setting
      delete task.data.value

      return task
    },

    settingOptions(): Array<{ title: string; value: string }> {
      return [
        { title: this.$t('dialogs.commandCreateDialog.userCooldown'), value: 'userCooldown' },
        { title: this.$t('dialogs.commandCreateDialog.globalCooldown'), value: 'globalCooldown' },
        { title: this.$t('dialogs.commandCreateDialog.singleUse'), value: 'single_use' },
        { title: this.$t('dialogs.commandCreateDialog.userListMode'), value: 'user_list_mode' },
        { title: this.$t('dialogs.commandCreateDialog.users'), value: 'users' },
        { title: this.$t('dialogs.commandCreateDialog.broadcaster'), value: 'requiresBroadcaster' },
        { title: this.$t('dialogs.commandCreateDialog.mod'), value: 'requiresMod' },
        { title: this.$t('dialogs.commandCreateDialog.vip'), value: 'requiresVip' },
      ]
    },

    availableSettingOptions(): Array<{ title: string; value: string }> {
      const selected = new Set(Object.keys(this.task.data.settings ?? {}))
      return this.settingOptions.filter(option => !selected.has(option.value))
    },

    settingEntries(): Array<{ key: string; value: any }> {
      return Object.entries(this.task.data.settings ?? {}).map(([key, value]) => ({
        key,
        value,
      }))
    },

    singleUseOptions() {
      return [
        { title: this.$t('dialogs.commandCreateDialog.singleUseNone'), value: 'none' },
        { title: this.$t('dialogs.commandCreateDialog.singleUseUser'), value: 'user' },
        { title: this.$t('dialogs.commandCreateDialog.singleUseGlobal'), value: 'global' },
      ]
    },

    userListModeOptions() {
      return [
        { title: this.$t('dialogs.commandCreateDialog.userListNone'), value: 'none' },
        { title: this.$t('dialogs.commandCreateDialog.userBlacklist'), value: 'blacklist' },
        { title: this.$t('dialogs.commandCreateDialog.userWhitelist'), value: 'whitelist' },
      ]
    },
  },

  methods: {
    settingTitle(setting: string) {
      return this.settingOptions.find(option => option.value === setting)?.title ?? setting
    },

    settingPreview(setting: string, value: any) {
      if (setting === 'users') {
        return Array.isArray(value) && value.length
          ? value.join(', ')
          : this.$t('macro.command.set.emptyUsers')
      }

      if (typeof value === 'boolean') {
        return value
          ? this.$t('common.enabled')
          : this.$t('common.disabled')
      }

      if (value === undefined || value === null || value === '') {
        return this.$t('macro.command.set.noValue')
      }

      return String(value)
    },

    defaultValue(setting: string) {
      switch (setting) {
        case 'single_use':
          return 'none'
        case 'user_list_mode':
          return 'none'
        case 'users':
          return []
        case 'userCooldown':
        case 'globalCooldown':
          return 0
        case 'requiresBroadcaster':
        case 'requiresMod':
        case 'requiresVip':
          return false
        default:
          return null
      }
    },

    addSetting(setting: string) {
      this.task.data.settings[setting] = this.defaultValue(setting)

      if (!this.openSettings.includes(setting)) {
        this.openSettings = [...this.openSettings, setting]
      }
    },

    removeSetting(setting: string) {
      delete this.task.data.settings[setting]
      this.openSettings = this.openSettings.filter(value => value !== setting)
    },
  },

  created() {
    this.task
    this.openSettings = Object.keys(this.task.data.settings ?? {})
  },
}
</script>

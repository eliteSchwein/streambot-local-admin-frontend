<template>
  <v-list-item class="event-entry-item" rounded="lg">
    <v-list-item-title class="text-truncate" :title="configName">
      {{ displayName }}
    </v-list-item-title>

    <template #append>
      <div class="event-entry-item__actions">
        <v-btn
          v-if="canSimulate"
          prepend-icon="mdi-play"
          color="secondary"
          variant="tonal"
          size="small"
          :text="$t('dialogs.eventEditorDialog.simulate')"
          :disabled="disabled"
          @click.stop="simulationDialog = true"
        />

        <v-btn
          prepend-icon="mdi-pencil"
          color="primary"
          variant="tonal"
          size="small"
          :text="$t('common.edit')"
          :disabled="disabled"
          @click.stop="$emit('edit', eventEntry)"
        />
      </div>
    </template>
  </v-list-item>

  <EventSimulationDialog
    v-model="simulationDialog"
    :event-entry="eventEntry"
    :disabled="disabled"
  />
</template>

<script lang="ts">
import EventSimulationDialog from '@/components/dialogs/EventSimulationDialog.vue'

export default {
  name: 'EventEntry',

  components: {
    EventSimulationDialog,
  },

  props: {
    eventEntry: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
  },

  emits: ['edit'],

  data() {
    return {
      simulationDialog: false,
    }
  },

  computed: {
    configName(): string {
      return String(this.eventEntry?.configName ?? '')
    },

    displayName(): string {
      const localeKey = String(this.eventEntry?.localeKey ?? '')

      if (localeKey && this.$te(localeKey)) {
        return this.$t(localeKey) as string
      }

      const raw = String(this.eventEntry?.name ?? this.configName)

      return raw
        .replace(/^event_/, '')
        .split('_')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    },

    configured(): boolean {
      return this.eventEntry?.configured === true
        || this.eventEntry?.asset === true
        || this.eventEntry?.macro === true
    },

    canSimulate(): boolean {
      return Array.isArray(this.eventEntry?.simulationFields)
        && this.eventEntry.simulationFields.length > 0
    },

    icon(): string {
      if (
        this.eventEntry?.channel === 'twitch'
        || this.eventEntry?.subchannel === 'twitch'
      ) {
        return 'mdi-twitch'
      }

      if (this.eventEntry?.channel === 'system') {
        return 'mdi-power'
      }

      return 'mdi-lightning-bolt'
    },
  },
}
</script>

<style scoped lang="scss">
.event-entry-item {
  margin-bottom: 4px;
}

.event-entry-item__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

<template>
  <MacroTaskAccordionTemplate
    class="macro-channel-point-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-pause-circle-outline"
    :title="baseTitle"
    :detail="task.data?.name || ''"
    export-prefix="macro_channel_point_pause"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
      :text="$t(task.method === 'unpause' ? 'macro.core.channelPointPause.unpauseInfo' : 'macro.core.channelPointPause.pauseInfo')"
    />

    <v-row density="comfortable">

      <v-col cols="12">
        <v-autocomplete
          v-model="task.data.name"
          :items="channelPointOptions"
          :label="$t('macro.core.channelPointPause.channelPointName')"
          persistent-hint
          prepend-inner-icon="mdi-star-circle"
          variant="outlined"
          hide-details="auto"
          clearable
          auto-select-first
          hide-no-data
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroChannelPointPauseTaskAccordion',

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
      appStore: useAppStore(),
    }
  },

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'channel_point'

      if (!['pause', 'unpause'].includes(task.method)) {
        task.method = 'pause'
      }

      task.data = task.data && typeof task.data === 'object' ? task.data : {}

      return task
    },

    baseTitle(): string {
      const key = this.task.method === 'unpause'
        ? 'macro.core.channelPointPause.unpauseReward'
        : 'macro.core.channelPointPause.pauseReward'
      return String(this.$t(key))
    },

    channelPointOptions(): string[] {
      const channelPoints = this.appStore.channelPoints ?? {
        active: [],
        all: [],
      }

      const active = Array.isArray(channelPoints.active)
        ? channelPoints.active
        : []

      const all = Array.isArray(channelPoints.all)
        ? channelPoints.all
        : []

      return [...new Set([...active, ...all]
        .map((point: any) =>
          point?.label ??
          point?.name ??
          point?.title ??
          point?.reward?.title ??
          point?.reward?.name,
        )
        .filter(Boolean)
        .map((value: any) => String(value).trim())
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.task
  },
}
</script>

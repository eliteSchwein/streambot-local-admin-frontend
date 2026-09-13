<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-timer-minus-outline"
    :title="$t('macro.final.timer.actions.reduceTime')"
    :detail="timerTitleDetail"
    export-prefix="macro_timer_reduce_time"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-combobox
          v-model="task.data.name"
          :items="timerNameOptions"
          :label="$t('macro.final.timer.timerName')"
          prepend-inner-icon="mdi-timer-outline"
          variant="outlined"
          hide-details="auto"
          auto-select-first
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-number-input
          v-model="task.data.time"
          :label="$t('macro.final.timer.time')"
          :min="1"
          :step="1"
          prepend-inner-icon="mdi-timer-outline"
          variant="outlined"
          hide-details="auto"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="task.data.unit"
          :items="timeUnitOptions"
          item-title="title"
          item-value="value"
          :label="$t('macro.function.sleep.unit')"
          prepend-inner-icon="mdi-clock-outline"
          variant="outlined"
          hide-details="auto"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroTimerReduceTimeTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],
  data() {
    return { appStore: useAppStore() }
  },
  computed: {
    timerTitleDetail(): string {
      const name = String(this.task.data?.name ?? '').trim()
      if (!name) return ''

      const time = Number(this.task.data?.time)
      const unit = String(this.task.data?.unit ?? 'seconds')
      if (!Number.isFinite(time)) return name

      const duration = String(this.$t(`macro.function.sleep.duration.${unit}`, { count: time }))
      return `${name} · ${duration}`
    },
    timerNameOptions(): string[] {
      const dynamicData = this.appStore?.getDynamicData ?? this.appStore?.dynamicData ?? {}
      const names = Array.isArray(dynamicData?.timer_names) ? dynamicData.timer_names : []
      const current = String(this.task.data?.name ?? this.task.data?.timer_name ?? '').trim()

      return [...new Set([
        ...names.map((value: any) => String(value).trim()).filter(Boolean),
        ...(current ? [current] : []),
      ])].sort((a, b) => a.localeCompare(b))
    },
    task(): any {
      const task = (this.item as any).task
      task.channel = 'timer'
      task.method = 'reduce_time'
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      if (!Number.isFinite(Number(task.data.time))) task.data.time = 1
      task.data.unit ||= 'seconds'
      return task
    },
    timeUnitOptions(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.function.sleep.units.seconds')), value: 'seconds' },
        { title: String(this.$t('macro.function.sleep.units.minutes')), value: 'minutes' },
        { title: String(this.$t('macro.function.sleep.units.hours')), value: 'hours' },
      ]
    },
  },
  created() { this.task },
  
}
</script>

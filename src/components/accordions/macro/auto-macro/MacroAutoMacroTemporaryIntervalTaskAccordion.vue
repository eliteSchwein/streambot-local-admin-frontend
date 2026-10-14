<template>
  <MacroTaskAccordionTemplate
    class="macro-auto-macro-temporary-interval-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-timer-cog-outline"
    :title="$t('macro.core.autoMacroTemporaryInterval.title')"
    :detail="detail"
    export-prefix="macro_auto_macro_temporary_interval"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row dense>
      <v-col cols="12">
        <AutoMacroSelect v-model="data.name" :label="$t('macro.core.autoMacroTemporaryInterval.autoMacro')" />
      </v-col>

      <v-col cols="12" sm="7">
        <v-text-field
          v-model.number="intervalAmount"
          type="number"
          :min="intervalUnit === 'milliseconds' ? 50 : 0.05"
          :step="intervalUnit === 'milliseconds' ? 1 : 0.05"
          density="comfortable"
          variant="outlined"
          hide-details
          :label="$t('macro.core.autoMacroTemporaryInterval.interval')"
        />
      </v-col>

      <v-col cols="12" sm="5">
        <v-select
          v-model="intervalUnit"
          :items="unitItems"
          item-title="title"
          item-value="value"
          density="comfortable"
          variant="outlined"
          hide-details
          :label="$t('macro.core.autoMacroTemporaryInterval.unit')"
        />
      </v-col>

      <v-col cols="12">
        <v-switch
          v-model="limitedDuration"
          color="primary"
          inset
          hide-details
          :label="$t('macro.core.autoMacroTemporaryInterval.limitDuration')"
        />
      </v-col>

      <template v-if="limitedDuration">
        <v-col cols="12" sm="7">
          <v-text-field
            v-model.number="durationAmount"
            type="number"
            :min="durationUnit === 'milliseconds' ? 1 : 0.001"
            :step="durationUnit === 'milliseconds' ? 1 : 0.1"
            density="comfortable"
            variant="outlined"
            hide-details
            :label="$t('macro.core.autoMacroTemporaryInterval.duration')"
          />
        </v-col>

        <v-col cols="12" sm="5">
          <v-select
            v-model="durationUnit"
            :items="unitItems"
            item-title="title"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            :label="$t('macro.core.autoMacroTemporaryInterval.unit')"
          />
        </v-col>
      </template>

      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          :text="limitedDuration
            ? $t('macro.core.autoMacroTemporaryInterval.durationHint')
            : $t('macro.core.autoMacroTemporaryInterval.untilResetHint')"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import AutoMacroSelect from './AutoMacroSelect.vue'

type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours'

const unitFactor = (unit: TimeUnit) => {
  if (unit === 'hours') return 3_600_000
  if (unit === 'minutes') return 60_000
  if (unit === 'seconds') return 1_000
  return 1
}

const bestUnit = (milliseconds: number): { amount: number, unit: TimeUnit } => {
  const value = Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : 1_000
  if (value >= 3_600_000 && value % 3_600_000 === 0) return { amount: value / 3_600_000, unit: 'hours' }
  if (value >= 60_000 && value % 60_000 === 0) return { amount: value / 60_000, unit: 'minutes' }
  if (value >= 1_000 && value % 1_000 === 0) return { amount: value / 1_000, unit: 'seconds' }
  return { amount: value, unit: 'milliseconds' }
}

export default {
  name: 'MacroAutoMacroTemporaryIntervalTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    AutoMacroSelect,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      intervalAmount: 1,
      intervalUnit: 'seconds' as TimeUnit,
      durationAmount: 1,
      durationUnit: 'minutes' as TimeUnit,
      limitedDuration: false,
      initialized: false,
    }
  },

  computed: {
    task(): any {
      const task = (this.item as any).task
      task.channel = 'auto_macro'
      task.method = 'set_interval'
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      return task
    },

    data(): any {
      return this.task.data
    },

    unitItems(): any[] {
      return [
        { title: this.$t('macro.core.autoMacroTemporaryInterval.milliseconds'), value: 'milliseconds' },
        { title: this.$t('macro.core.autoMacroTemporaryInterval.seconds'), value: 'seconds' },
        { title: this.$t('macro.core.autoMacroTemporaryInterval.minutes'), value: 'minutes' },
        { title: this.$t('macro.core.autoMacroTemporaryInterval.hours'), value: 'hours' },
      ]
    },

    detail(): string {
      const name = String(this.data.name ?? '').trim()
      const interval = `${this.intervalAmount} ${this.unitLabel(this.intervalUnit)}`
      return name ? `${name} · ${interval}` : interval
    },
  },

  watch: {
    intervalAmount() { this.syncData() },
    intervalUnit() { this.syncData() },
    durationAmount() { this.syncData() },
    durationUnit() { this.syncData() },
    limitedDuration() { this.syncData() },
  },

  created() {
    const data = this.task.data
    if (data.name === undefined) data.name = data.autoMacro ?? ''
    delete data.autoMacro

    const rawIntervalMs = data.interval_ms !== undefined
      ? Number(data.interval_ms)
      : data.interval !== undefined
        ? Number(data.interval) * 1_000
        : 1_000
    const interval = bestUnit(Math.max(50, Number.isFinite(rawIntervalMs) ? rawIntervalMs : 1_000))
    this.intervalAmount = interval.amount
    this.intervalUnit = interval.unit

    const rawDurationMs = data.duration_ms !== undefined
      ? Number(data.duration_ms)
      : data.duration !== undefined
        ? Number(data.duration) * 1_000
        : undefined
    this.limitedDuration = Number.isFinite(rawDurationMs) && Number(rawDurationMs) > 0
    if (this.limitedDuration) {
      const duration = bestUnit(Number(rawDurationMs))
      this.durationAmount = duration.amount
      this.durationUnit = duration.unit
    }

    this.initialized = true
    this.syncData()
  },

  methods: {
    unitLabel(unit: TimeUnit): string {
      if (unit === 'milliseconds') return 'ms'
      if (unit === 'seconds') return 's'
      if (unit === 'minutes') return 'min'
      return 'h'
    },

    syncData() {
      if (!this.initialized) return
      const intervalMs = Math.max(50, Math.round(Number(this.intervalAmount || 0) * unitFactor(this.intervalUnit)))
      this.data.interval_ms = intervalMs
      delete this.data.interval

      if (this.limitedDuration) {
        const durationMs = Math.max(1, Math.round(Number(this.durationAmount || 0) * unitFactor(this.durationUnit)))
        this.data.duration_ms = durationMs
      } else {
        delete this.data.duration_ms
      }
      delete this.data.duration
    },
  },
}
</script>

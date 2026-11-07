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
          v-model="intervalAmount"
          inputmode="decimal"
          density="comfortable"
          variant="outlined"
          persistent-hint
          :hint="$t('macro.core.autoMacroTemporaryInterval.valueHint')"
          :placeholder="templatePlaceholder"
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
            v-model="durationAmount"
            inputmode="decimal"
            density="comfortable"
            variant="outlined"
            persistent-hint
            :hint="$t('macro.core.autoMacroTemporaryInterval.valueHint')"
            :placeholder="templatePlaceholder"
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

const normalizeUnit = (unit: any, fallback: TimeUnit): TimeUnit => {
  const value = String(unit ?? '').trim().toLowerCase()
  if (value === 'ms' || value === 'milliseconds') return 'milliseconds'
  if (value === 's' || value === 'seconds') return 'seconds'
  if (value === 'min' || value === 'minutes') return 'minutes'
  if (value === 'h' || value === 'hours') return 'hours'
  return fallback
}

const bestUnit = (milliseconds: number): { amount: number, unit: TimeUnit } => {
  const value = Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : 1_000
  if (value >= 3_600_000 && value % 3_600_000 === 0) return { amount: value / 3_600_000, unit: 'hours' }
  if (value >= 60_000 && value % 60_000 === 0) return { amount: value / 60_000, unit: 'minutes' }
  if (value >= 1_000 && value % 1_000 === 0) return { amount: value / 1_000, unit: 'seconds' }
  return { amount: value, unit: 'milliseconds' }
}

const isSet = (value: any) => value !== undefined && value !== null && value !== ''

// Template values like "${effect_interval}" or "${effect_interval}000" are
// resolved by the backend at runtime and must be kept verbatim.
const isTemplate = (value: any) => typeof value === 'string' && value.includes('${')

const toNumber = (value: any) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? NaN : Number(trimmed)
  }
  return Number(value)
}

/**
 * Reads `<key>_ms` or `<key>` + `<key>_unit` (seconds by default) into an
 * editor amount/unit pair. Template strings are preserved as-is.
 */
const readTimeValue = (data: any, key: string, fallbackMs: number | undefined): { amount: string | number, unit: TimeUnit } | undefined => {
  const msValue = data[`${key}_ms`]
  if (isSet(msValue)) {
    if (isTemplate(msValue)) return { amount: String(msValue), unit: 'milliseconds' }
    const ms = toNumber(msValue)
    if (Number.isFinite(ms) && ms > 0) return bestUnit(ms)
  }

  const rawValue = data[key]
  if (isSet(rawValue)) {
    const unit = normalizeUnit(data[`${key}_unit`], 'seconds')
    if (isTemplate(rawValue)) return { amount: String(rawValue), unit }
    const amount = toNumber(rawValue)
    if (Number.isFinite(amount) && amount > 0) return bestUnit(amount * unitFactor(unit))
  }

  return fallbackMs === undefined ? undefined : bestUnit(fallbackMs)
}

/**
 * Writes an editor amount/unit pair back to the task data. Plain numbers are
 * stored as `<key>_ms`; template strings are stored as `<key>_ms` (ms unit) or
 * `<key>` + `<key>_unit` so the backend applies the unit after interpolation.
 */
const writeTimeValue = (data: any, key: string, amount: any, unit: TimeUnit, minimumMs: number) => {
  delete data[key]
  delete data[`${key}_unit`]
  delete data[`${key}_ms`]

  if (isTemplate(amount)) {
    const value = String(amount).trim()
    if (unit === 'milliseconds') {
      data[`${key}_ms`] = value
    } else {
      data[key] = value
      data[`${key}_unit`] = unit
    }
    return
  }

  const numeric = toNumber(amount)
  data[`${key}_ms`] = Math.max(minimumMs, Math.round((Number.isFinite(numeric) ? numeric : 0) * unitFactor(unit)))
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
      intervalAmount: 1 as string | number,
      intervalUnit: 'seconds' as TimeUnit,
      durationAmount: 1 as string | number,
      durationUnit: 'minutes' as TimeUnit,
      limitedDuration: false,
      initialized: false,
      templatePlaceholder: '${variable}',
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

    const interval = readTimeValue(data, 'interval', 1_000)!
    this.intervalAmount = interval.amount
    this.intervalUnit = interval.unit

    const duration = readTimeValue(data, 'duration', undefined)
    this.limitedDuration = duration !== undefined
    if (duration) {
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
      writeTimeValue(this.data, 'interval', this.intervalAmount, this.intervalUnit, 50)

      if (this.limitedDuration) {
        writeTimeValue(this.data, 'duration', this.durationAmount, this.durationUnit, 1)
      } else {
        delete this.data.duration
        delete this.data.duration_unit
        delete this.data.duration_ms
      }
    },
  },
}
</script>

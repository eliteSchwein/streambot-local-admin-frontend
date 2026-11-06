<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-task-accordion--format"
    :item="item"
    :index="index"
    :icon="methodIcon"
    :title="$t('macro.format.title')"
    :detail="titleDetail"
    export-prefix="macro_format"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12" md="4">
        <v-select
          v-model="task.method"
          :items="methodOptions"
          :label="$t('macro.format.method')"
          prepend-inner-icon="mdi-format-text-variant"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          @update:model-value="ensureDefaults"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="data.value"
          :label="$t('macro.format.value')"
          :hint="$t(`macro.format.valueHints.${task.method}`)"
          persistent-hint
          prepend-inner-icon="mdi-code-braces"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="data.key"
          :label="$t('macro.format.key')"
          :hint="$t('macro.format.keyHint')"
          persistent-hint
          prepend-inner-icon="mdi-variable"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- date -->
      <template v-if="task.method === 'date'">
        <v-col cols="12" md="6">
          <v-combobox
            v-model="data.format"
            :items="datePresetOptions"
            :return-object="false"
            :label="$t('macro.format.format')"
            :hint="$t('macro.format.formatHint')"
            persistent-hint
            prepend-inner-icon="mdi-calendar-clock"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="data.timezone"
            :label="$t('macro.format.timezone')"
            :hint="$t('macro.format.timezoneHint')"
            persistent-hint
            placeholder="Europe/Berlin"
            prepend-inner-icon="mdi-earth"
            clearable
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </template>

      <!-- duration -->
      <template v-if="task.method === 'duration'">
        <v-col cols="12" md="3">
          <v-select
            v-model="data.unit"
            :items="options('durationUnits', ['seconds', 'milliseconds', 'minutes', 'hours', 'since', 'until'])"
            :label="$t('macro.format.unit')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="data.style"
            :items="options('durationStyles', ['long', 'short', 'clock'])"
            :label="$t('macro.format.style')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="data.smallest_unit"
            :disabled="data.style === 'clock'"
            :items="options('timeUnits', ['year', 'month', 'day', 'hour', 'minute', 'second'])"
            :label="$t('macro.format.smallestUnit')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-number-input
            v-model="data.max_units"
            :disabled="data.style === 'clock'"
            :min="0"
            :label="$t('macro.format.maxUnits')"
            :hint="$t('macro.format.maxUnitsHint')"
            persistent-hint
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </template>

      <!-- case -->
      <v-col v-if="task.method === 'case'" cols="12" md="6">
        <v-select
          v-model="data.mode"
          :items="options('caseModes', ['upper', 'lower', 'capitalize', 'title'])"
          :label="$t('macro.format.mode')"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- truncate -->
      <template v-if="task.method === 'truncate'">
        <v-col cols="12" md="4">
          <v-number-input
            v-model="data.length"
            :min="0"
            :label="$t('macro.format.length')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="data.suffix"
            :label="$t('macro.format.suffix')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-switch
            v-model="data.words"
            :label="$t('macro.format.words')"
            color="primary"
            hide-details="auto"
            density="comfortable"
          />
        </v-col>
      </template>

      <!-- replace -->
      <template v-if="task.method === 'replace'">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="data.search"
            :label="$t('macro.format.search')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
            :class="{ 'font-monospace': data.regex }"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="data.replacement"
            :label="$t('macro.format.replacement')"
            :hint="data.regex ? $t('macro.format.replacementRegexHint') : ''"
            persistent-hint
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="data.regex"
            :label="$t('macro.format.regex')"
            color="primary"
            hide-details="auto"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="data.ignore_case"
            :label="$t('macro.format.ignoreCase')"
            color="primary"
            hide-details="auto"
            density="comfortable"
          />
        </v-col>
      </template>

      <!-- pad -->
      <template v-if="task.method === 'pad'">
        <v-col cols="12" md="4">
          <v-number-input
            v-model="data.length"
            :min="0"
            :label="$t('macro.format.length')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="data.char"
            :label="$t('macro.format.char')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="data.side"
            :items="options('padSides', ['start', 'end', 'both'])"
            :label="$t('macro.format.side')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </template>

      <!-- number -->
      <template v-if="task.method === 'number'">
        <v-col cols="12" md="6">
          <v-select
            v-model="data.style"
            :items="options('numberStyles', ['decimal', 'percent', 'compact'])"
            :label="$t('macro.format.style')"
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-number-input
            v-model="data.decimals"
            :min="0"
            :max="20"
            :label="$t('macro.format.decimals')"
            :hint="$t('macro.format.decimalsHint')"
            persistent-hint
            clearable
            hide-details="auto"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </template>

      <v-col v-if="localeAware" cols="12" md="6">
        <v-select
          v-model="data.locale"
          :items="localeOptions"
          :label="$t('macro.format.locale')"
          prepend-inner-icon="mdi-translate"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

const methods = ['date', 'duration', 'case', 'truncate', 'replace', 'pad', 'number']

const methodIcons: Record<string, string> = {
  date: 'mdi-calendar-clock',
  duration: 'mdi-timer-outline',
  case: 'mdi-format-letter-case',
  truncate: 'mdi-content-cut',
  replace: 'mdi-find-replace',
  pad: 'mdi-format-horizontal-align-right',
  number: 'mdi-numeric',
}

const defaults: Record<string, Record<string, any>> = {
  date: { format: 'datetime', timezone: '' },
  duration: { unit: 'seconds', style: 'long', smallest_unit: 'second', max_units: 3 },
  case: { mode: 'upper' },
  truncate: { length: 100, suffix: '…', words: false },
  replace: { search: '', replacement: '', regex: false, ignore_case: false },
  pad: { length: 2, char: '0', side: 'start' },
  number: { style: 'decimal', decimals: null },
}

const datePresets = ['date', 'date_short', 'date_long', 'time', 'time_seconds', 'datetime', 'datetime_long', 'relative', 'iso', 'unix']

export default {
  name: 'MacroFormatTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      return (this.item as any).task
    },

    data(): any {
      return this.task.data
    },

    methodOptions(): { title: string, value: string }[] {
      return this.options('methods', methods)
    },

    methodIcon(): string {
      return methodIcons[this.task.method] ?? 'mdi-format-text-variant'
    },

    titleDetail(): string {
      const method = this.$t(`macro.format.methods.${this.task.method}`)
      const key = String(this.data?.key ?? '').trim()

      return key ? `${method} → \${${key}}` : method
    },

    datePresetOptions(): { title: string, value: string }[] {
      return datePresets.map((value) => ({
        title: `${this.$t(`macro.format.datePresets.${value}`)} (${value})`,
        value,
      }))
    },

    localeAware(): boolean {
      return ['date', 'duration', 'case', 'number'].includes(this.task.method)
    },

    localeOptions(): { title: string, value: string }[] {
      return [
        { title: this.$t('macro.format.localeAuto'), value: '' },
        { title: 'Deutsch', value: 'de' },
        { title: 'English', value: 'en' },
      ]
    },
  },

  created() {
    this.task.channel = 'format'

    if (!methods.includes(this.task.method)) this.task.method = 'date'

    if (!this.task.data || typeof this.task.data !== 'object') {
      this.task.data = {}
    }

    if (this.task.data.value === undefined) this.task.data.value = ''
    if (this.task.data.key === undefined) this.task.data.key = 'formatted'
    if (this.task.data.locale === undefined) this.task.data.locale = ''

    this.ensureDefaults()
  },

  methods: {
    options(group: string, values: string[]): { title: string, value: string }[] {
      return values.map((value) => ({
        title: this.$t(`macro.format.${group}.${value}`),
        value,
      }))
    },

    ensureDefaults() {
      for (const [key, value] of Object.entries(defaults[this.task.method] ?? {})) {
        if (this.task.data[key] === undefined) this.task.data[key] = value
      }

      // style is shared by duration and number with different values
      const styles: Record<string, string[]> = {
        duration: ['long', 'short', 'clock'],
        number: ['decimal', 'percent', 'compact'],
      }

      const allowed = styles[this.task.method]
      if (allowed && !allowed.includes(this.task.data.style)) {
        this.task.data.style = allowed[0]
      }
    },
  },
}
</script>

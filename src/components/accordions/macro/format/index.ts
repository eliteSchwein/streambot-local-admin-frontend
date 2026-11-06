export { default as MacroFormatTaskAccordion } from './MacroFormatTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

const path = [
  { titleKey: 'macro.presets.format.title', icon: 'mdi-format-text-variant' },
]

const preset = (method: string, icon: string, order: number, data: Record<string, any>): MacroTaskPresetRegistration => ({
  path,
  titleKey: `macro.presets.format.${method}`,
  icon,
  order,
  create: () => ({ type: 'task', task: { channel: 'format', method, data: { value: '', key: 'formatted', ...data } } }),
})

export const formatMacroTaskPresets: MacroTaskPresetRegistration[] = [
  preset('date', 'mdi-calendar-clock', 35, { format: 'datetime' }),
  preset('duration', 'mdi-timer-outline', 36, { unit: 'seconds', style: 'long', smallest_unit: 'second', max_units: 3 }),
  preset('case', 'mdi-format-letter-case', 37, { mode: 'upper' }),
  preset('truncate', 'mdi-content-cut', 38, { length: 100, suffix: '…', words: false }),
  preset('replace', 'mdi-find-replace', 39, { search: '', replacement: '', regex: false, ignore_case: false }),
  preset('pad', 'mdi-format-horizontal-align-right', 40, { length: 2, char: '0', side: 'start' }),
  preset('number', 'mdi-numeric', 41, { style: 'decimal' }),
]

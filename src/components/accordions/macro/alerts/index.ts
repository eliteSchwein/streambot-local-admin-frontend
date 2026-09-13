export { default as MacroAlertTaskAccordion } from './MacroAlertTaskAccordion.vue'
export { default as MacroDummyAlertTaskAccordion } from './MacroDummyAlertTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const alertsMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    titleKey: "macro.presets.alert",
    icon: "mdi-bell-ring",
    order: 14,
    create: () => ({ type: 'task', task: { channel: 'alert', message: '', asset: '' } }),
  },
]

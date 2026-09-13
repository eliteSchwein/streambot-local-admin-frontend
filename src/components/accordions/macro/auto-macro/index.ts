export { default as AutoMacroSelect } from './AutoMacroSelect.vue'
export { default as MacroAutoMacroStartTaskAccordion } from './MacroAutoMacroStartTaskAccordion.vue'
export { default as MacroAutoMacroStopTaskAccordion } from './MacroAutoMacroStopTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const autoMacroMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.startAutoMacro",
    icon: "mdi-play-circle-outline",
    order: 8,
    create: () => ({ type: 'task', task: { channel: 'auto_macro', method: 'start', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.stopAutoMacro",
    icon: "mdi-stop-circle-outline",
    order: 9,
    create: () => ({ type: 'task', task: { channel: 'auto_macro', method: 'stop', data: { name: '' } } }),
  },
]

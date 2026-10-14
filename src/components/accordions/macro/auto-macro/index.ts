export { default as AutoMacroSelect } from './AutoMacroSelect.vue'
export { default as MacroAutoMacroStartTaskAccordion } from './MacroAutoMacroStartTaskAccordion.vue'
export { default as MacroAutoMacroStopTaskAccordion } from './MacroAutoMacroStopTaskAccordion.vue'
export { default as MacroAutoMacroTemporaryIntervalTaskAccordion } from './MacroAutoMacroTemporaryIntervalTaskAccordion.vue'
export { default as MacroAutoMacroResetIntervalTaskAccordion } from './MacroAutoMacroResetIntervalTaskAccordion.vue'

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
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.temporaryAutoMacroInterval",
    icon: "mdi-timer-cog-outline",
    order: 10,
    create: () => ({ type: 'task', task: { channel: 'auto_macro', method: 'set_interval', data: { name: '', interval_ms: 1000 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.resetAutoMacroInterval",
    icon: "mdi-timer-refresh-outline",
    order: 11,
    create: () => ({ type: 'task', task: { channel: 'auto_macro', method: 'reset_interval', data: { name: '' } } }),
  },
]

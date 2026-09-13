export { default as MacroMacroTaskAccordion } from './MacroMacroTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const macroMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.runMacro",
    icon: "mdi-playlist-play",
    order: 7,
    create: () => ({ type: 'task', task: { channel: 'macro', method: '', data: {} } }),
  },
]

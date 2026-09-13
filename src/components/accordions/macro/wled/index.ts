export { default as MacroWledCustomTaskAccordion } from './MacroWledCustomTaskAccordion.vue'
export { default as MacroWledOffTaskAccordion } from './MacroWledOffTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const wledMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.lights.title", icon: "mdi-led-on" },
    ],
    titleKey: "macro.presets.lights.wled",
    icon: "mdi-led-strip-variant",
    order: 130,
    create: () => ({ type: 'task', task: { channel: 'wled', method: 'custom', data: { name: '', red: 255, green: 255, blue: 255, white: 0, brightness: 255, effect: 0 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.lights.title", icon: "mdi-led-on" },
    ],
    titleKey: "macro.presets.lights.wledOff",
    icon: "mdi-led-strip-variant-off",
    order: 131,
    create: () => ({ type: 'task', task: { channel: 'wled', method: 'off', data: { name: '' } } }),
  },
]

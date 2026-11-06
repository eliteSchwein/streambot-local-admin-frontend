export { default as MacroCssTaskAccordion } from './MacroCssTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const cssMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.overlay.title", icon: "mdi-monitor-dashboard" },
    ],
    titleKey: "macro.presets.overlay.cssSet",
    icon: "mdi-language-css3",
    order: 16,
    create: () => ({ type: 'task', task: { channel: 'css', method: 'set', data: { selector: '', css: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.overlay.title", icon: "mdi-monitor-dashboard" },
    ],
    titleKey: "macro.presets.overlay.cssReset",
    icon: "mdi-restore",
    order: 17,
    create: () => ({ type: 'task', task: { channel: 'css', method: 'reset', data: { selector: '' } } }),
  },
]

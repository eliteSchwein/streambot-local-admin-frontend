export { default as MacroOverlayVariableTaskAccordion } from './MacroOverlayVariableTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const overlayVariableMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.overlay.title", icon: "mdi-monitor-dashboard" },
    ],
    titleKey: "macro.presets.overlay.showVariable",
    icon: "mdi-variable",
    order: 18,
    create: () => ({ type: 'task', task: { channel: 'overlay_variable', method: 'show', data: { key: '', value: '' } } }),
  },
]

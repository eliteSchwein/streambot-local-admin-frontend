export { default as MacroSystemRebootTaskAccordion } from './MacroSystemRebootTaskAccordion.vue'
export { default as MacroSystemShutdownTaskAccordion } from './MacroSystemShutdownTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const systemMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.system.title", icon: "mdi-power-settings" },
    ],
    titleKey: "macro.presets.system.reboot",
    icon: "mdi-restart",
    order: 132,
    create: () => ({ type: 'task', task: { channel: 'system', method: 'reboot', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.system.title", icon: "mdi-power-settings" },
    ],
    titleKey: "macro.presets.system.shutdown",
    icon: "mdi-power",
    order: 133,
    create: () => ({ type: 'task', task: { channel: 'system', method: 'shutdown', data: {} } }),
  },
]

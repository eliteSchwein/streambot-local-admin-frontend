// Generic/raw macro tasks that do not belong to a concrete channel.

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const miscMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.rawTask",
    icon: "mdi-code-json",
    order: 143,
    create: () => ({ type: 'task', task: { channel: '', method: '', data: {} } }),
  },
]

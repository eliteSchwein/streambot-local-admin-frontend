export { default as MacroThemeRestoreColorTaskAccordion } from './MacroThemeRestoreColorTaskAccordion.vue'
export { default as MacroThemeSetColorTaskAccordion } from './MacroThemeSetColorTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const themeMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.theme.title", icon: "mdi-palette-outline" },
    ],
    titleKey: "macro.theme.setColor.title",
    icon: "mdi-palette",
    order: 141,
    create: () => ({ type: 'task', task: {
                    channel: 'theme',
                    method: 'set_color',
                    data: {
                      color: 'ff9800',
                    },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.theme.title", icon: "mdi-palette-outline" },
    ],
    titleKey: "macro.theme.restoreColor.title",
    icon: "mdi-palette-outline",
    order: 142,
    create: () => ({ type: 'task', task: {
                    channel: 'theme',
                    method: 'restore_color',
                    data: {},
                  } }),
  },
]

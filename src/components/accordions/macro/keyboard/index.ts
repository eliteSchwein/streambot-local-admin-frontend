export { default as MacroKeyboardTaskAccordion } from './MacroKeyboardTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const keyboardMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.keyboard",
    icon: "mdi-keyboard-outline",
    order: 145,
    create: () => ({ type: 'task', task: {
                channel: 'keyboard',
                method: 'press',
                data: {
                  name: 'macro',
                  keys: [],
                  duration: undefined,
                },
              } }),
  },
]

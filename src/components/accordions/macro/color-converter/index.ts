export { default as MacroColorConverterTaskAccordion } from './MacroColorConverterTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const colorConverterMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: 'macro.presets.color.title', icon: 'mdi-palette-outline' },
    ],
    titleKey: 'macro.presets.color.converter',
    icon: 'mdi-swap-horizontal-bold',
    order: 34,
    create: () => ({
      type: 'task',
      task: {
        channel: 'color_converter',
        method: 'convert',
        data: {
          from: 'hex',
          to: 'rgb',
          value: '',
          key: 'converted_color',
        },
      },
    }),
  },
]

export { default as MacroVariableGetTaskAccordion } from './MacroVariableGetTaskAccordion.vue'
export { default as MacroVariableLocalSetTaskAccordion } from './MacroVariableLocalSetTaskAccordion.vue'
export { default as MacroVariableSetTaskAccordion } from './MacroVariableSetTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const variablesMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.variables.title", icon: "mdi-variable" },
    ],
    titleKey: "macro.presets.variables.setVariable",
    icon: "mdi-database-export-outline",
    order: 48,
    create: () => ({ type: 'task', task: { channel: 'variable', method: 'set', data: { value: null, key: '', to_file: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.variables.title", icon: "mdi-variable" },
    ],
    titleKey: "macro.core.variableLocalSet.title",
    icon: "mdi-variable-box",
    order: 49,
    create: () => ({ type: 'task', task: {
                channel: 'variable',
                method: 'local_set',
                data: {
                  key: '',
                  expression: '',
                },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.variables.title", icon: "mdi-variable" },
    ],
    titleKey: "macro.presets.variables.getVariable",
    icon: "mdi-database-import-outline",
    order: 50,
    create: () => ({ type: 'task', task: { channel: 'variable', method: 'get', data: { key: '' } } }),
  },
]

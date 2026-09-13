export { default as MacroCommandDisableTaskAccordion } from './MacroCommandDisableTaskAccordion.vue'
export { default as MacroCommandEnableTaskAccordion } from './MacroCommandEnableTaskAccordion.vue'
export { default as MacroCommandResetAllTaskAccordion } from './MacroCommandResetAllTaskAccordion.vue'
export { default as MacroCommandResetTaskAccordion } from './MacroCommandResetTaskAccordion.vue'
export { default as MacroCommandSelect } from './MacroCommandSelect.vue'
export { default as MacroCommandSetTaskAccordion } from './MacroCommandSetTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const commandMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.command.title", icon: "mdi-console-line" },
    ],
    titleKey: "macro.command.enable.title",
    icon: "mdi-toggle-switch",
    order: 42,
    create: () => ({ type: 'task', task: { channel: 'command', method: 'enable', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.command.title", icon: "mdi-console-line" },
    ],
    titleKey: "macro.command.disable.title",
    icon: "mdi-toggle-switch-off-outline",
    order: 43,
    create: () => ({ type: 'task', task: { channel: 'command', method: 'disable', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.command.title", icon: "mdi-console-line" },
    ],
    titleKey: "macro.command.set.title",
    icon: "mdi-tune-variant",
    order: 45,
    create: () => ({ type: 'task', task: { channel: 'command', method: 'set', data: { name: '', settings: {} } } }),
  },
  {
    path: [
      { titleKey: "macro.command.title", icon: "mdi-console-line" },
    ],
    titleKey: "macro.command.reset.title",
    icon: "mdi-restore",
    order: 46,
    create: () => ({ type: 'task', task: { channel: 'command', method: 'reset', data: { name: '', setting: 'enabled' } } }),
  },
  {
    path: [
      { titleKey: "macro.command.title", icon: "mdi-console-line" },
    ],
    titleKey: "macro.command.resetAll.title",
    icon: "mdi-restore-alert",
    order: 47,
    create: () => ({ type: 'task', task: { channel: 'command', method: 'reset_all', data: { name: '' } } }),
  },
]

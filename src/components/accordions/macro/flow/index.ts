export { default as MacroConditionTaskAccordion } from './MacroConditionTaskAccordion.vue'
export { default as MacroEndMacroTaskAccordion } from './MacroEndMacroTaskAccordion.vue'
export { default as MacroLoopControlTaskAccordion } from './MacroLoopControlTaskAccordion.vue'
export { default as MacroLoopTaskAccordion } from './MacroLoopTaskAccordion.vue'
export { default as MacroSwitchBreakTaskAccordion } from './MacroSwitchBreakTaskAccordion.vue'
export { default as MacroSwitchTaskAccordion } from './MacroSwitchTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const flowMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.presets.conditions.ifCondition",
    icon: "mdi-source-branch",
    order: 0,
    create: () => ({ type: 'condition', task: { channel: 'condition', method: 'if', check: '' }, children: [], branches: [] }),
  },
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.presets.conditions.forLoop",
    icon: "mdi-repeat",
    order: 1,
    create: () => ({ type: 'loop', task: { channel: 'loop', method: 'for', data: { key: 'item', from: 1, to: 10 } }, children: [] }),
  },
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.core.switch.title",
    icon: "mdi-call-split",
    order: 2,
    create: () => ({ type: 'switch', task: { channel: 'switch', method: 'switch', data: { input: '' } }, cases: [] }),
  },
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.core.switch.breakTitle",
    icon: "mdi-stop-circle-outline",
    order: 4,
    switchOnly: true,
    create: () => ({ type: 'task', task: { channel: 'switch', method: 'break' } }),
  },
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.presets.conditions.loopBreak",
    icon: "mdi-stop-circle-outline",
    order: 5,
    loopOnly: true,
    create: () => ({ type: 'task', task: { channel: 'loop', method: 'break' } }),
  },
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.presets.conditions.loopContinue",
    icon: "mdi-skip-next-outline",
    order: 6,
    loopOnly: true,
    create: () => ({ type: 'task', task: { channel: 'loop', method: 'continue' } }),
  },
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.endMacro",
    icon: "mdi-stop-circle-outline",
    order: 13,
    create: () => ({ type: 'task', task: { channel: 'condition', method: 'end_macro' } }),
  },
]

export { default as MacroRotateSceneStartTaskAccordion } from './MacroRotateSceneStartTaskAccordion.vue'
export { default as MacroRotateSceneStopTaskAccordion } from './MacroRotateSceneStopTaskAccordion.vue'
export { default as RotatingSceneSelect } from './RotatingSceneSelect.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const rotateSceneMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.startSceneRotation",
    icon: "mdi-play-circle-outline",
    order: 11,
    create: () => ({ type: 'task', task: { channel: 'rotate_scene', method: 'start', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.macro.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.macro.stopSceneRotation",
    icon: "mdi-stop-circle-outline",
    order: 12,
    create: () => ({ type: 'task', task: { channel: 'rotate_scene', method: 'stop', data: { name: '' } } }),
  },
]

export { default as MacroAnimationTaskAccordion } from './MacroAnimationTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const animationMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    titleKey: "macro.presets.animation",
    icon: "mdi-animation-play",
    order: 15,
    create: () => ({ type: 'task', task: { channel: 'animation', method: 'play' } }),
  },
]

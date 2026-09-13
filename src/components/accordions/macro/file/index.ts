export { default as MacroFileTaskAccordion } from './MacroFileTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const fileMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    titleKey: "macro.presets.fileReadAssetFolder",
    icon: "mdi-folder-open-outline",
    order: 33,
    create: () => ({ type: 'task', task: { channel: 'file', method: 'read_folder', data: { path: '/', key: 'files', fileExtension: null } } }),
  },
]

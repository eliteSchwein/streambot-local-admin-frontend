export { default as MacroAudioAdjustVolumeTaskAccordion } from './MacroAudioAdjustVolumeTaskAccordion.vue'
export { default as MacroAudioLoadPresetTaskAccordion } from './MacroAudioLoadPresetTaskAccordion.vue'
export { default as MacroAudioSetVolumeTaskAccordion } from './MacroAudioSetVolumeTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const audioMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.volumeControl.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.audio.volumeControl.setVolume",
    icon: "mdi-volume-high",
    order: 52,
    create: () => ({ type: 'task', task: {
                    channel: 'audio',
                    method: 'set_volume',
                    data: { interface: '', volume: 50 },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.volumeControl.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.audio.volumeControl.adjustVolume",
    icon: "mdi-volume-plus",
    order: 53,
    create: () => ({ type: 'task', task: {
                    channel: 'audio',
                    method: 'adjust_volume',
                    data: { interface: '', volume: 10 },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.volumeControl.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.audio.loadPreset",
    icon: "mdi-tune-variant",
    order: 54,
    create: () => ({ type: 'task', task: {
                    channel: 'audio',
                    method: 'load_preset',
                    data: { name: '' },
                  } }),
  },
]

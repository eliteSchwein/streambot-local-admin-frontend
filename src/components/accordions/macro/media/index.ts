export { default as MacroAssetSelect } from './MacroAssetSelect.vue'
export { default as MacroClearMediaTaskAccordion } from './MacroClearMediaTaskAccordion.vue'
export { default as MacroFfmpegTaskAccordion } from './MacroFfmpegTaskAccordion.vue'
export { default as MacroMediaTaskAccordion } from './MacroMediaTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const mediaMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.mediaGroup.title", icon: "mdi-multimedia" },
    ],
    titleKey: "macro.presets.mediaGroup.show",
    icon: "mdi-play-box-outline",
    order: 16,
    create: () => ({ type: 'task', task: {
                channel: 'media',
                method: 'show_media',
                data: {
                  target: 'default',
                  path: '',
                  type: null,
                  clearOnEmpty: true,
                  autoplay: true,
                  loop: false,
                  muted: false,
                  controls: false,
                },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.mediaGroup.title", icon: "mdi-multimedia" },
    ],
    titleKey: "macro.presets.mediaGroup.ffmpeg",
    icon: "mdi-movie-open-cog-outline",
    order: 17,
    create: () => ({ type: 'task', task: {
                channel: 'media',
                method: 'ffmpeg',
                data: {
                  input: '',
                  filter_inputs: [],
                  arguments: '',
                  output_folder: '',
                  output_filename: 'output.mp4',
                  temporary_file: false,
                  result_variable: 'ffmpeg_output',
                },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.mediaGroup.title", icon: "mdi-multimedia" },
    ],
    titleKey: "macro.presets.mediaGroup.clear",
    icon: "mdi-image-off-outline",
    order: 18,
    create: () => ({ type: 'task', task: {
                channel: 'media',
                method: 'clear_media',
                data: {
                  target: 'default',
                },
              } }),
  },
]

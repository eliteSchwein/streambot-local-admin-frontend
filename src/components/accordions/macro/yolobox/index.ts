export { default as MacroYoloboxAudioAfvTaskAccordion } from './MacroYoloboxAudioAfvTaskAccordion.vue'
export { default as MacroYoloboxAudioDelayTaskAccordion } from './MacroYoloboxAudioDelayTaskAccordion.vue'
export { default as MacroYoloboxAudioMuteTaskAccordion } from './MacroYoloboxAudioMuteTaskAccordion.vue'
export { default as MacroYoloboxAudioVolumeTaskAccordion } from './MacroYoloboxAudioVolumeTaskAccordion.vue'
export { default as MacroYoloboxLiveStatusTaskAccordion } from './MacroYoloboxLiveStatusTaskAccordion.vue'
export { default as MacroYoloboxOverlayTaskAccordion } from './MacroYoloboxOverlayTaskAccordion.vue'
export { default as MacroYoloboxVideoSourceTaskAccordion } from './MacroYoloboxVideoSourceTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const yoloboxMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
    ],
    titleKey: "macro.presets.yolobox.switchVideoSource",
    icon: "mdi-video-switch",
    order: 87,
    create: () => ({ type: 'task', task: {
                channel: 'yolobox',
                method: 'switch_video_source',
                data: { id: '' },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.overlays.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.yolobox.overlays.enableOverlay",
    icon: "mdi-eye-outline",
    order: 88,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_material_change',
                    data: { id: '', isSelected: true },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.overlays.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.yolobox.overlays.disableOverlay",
    icon: "mdi-eye-off-outline",
    order: 89,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_material_change',
                    data: { id: '', isSelected: false },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.overlays.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.yolobox.overlays.disableAllOverlays",
    icon: "mdi-layers-off-outline",
    order: 90,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_material_change',
                    data: { id: 'all', isSelected: false },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.setVolume",
    icon: "mdi-volume-high",
    order: 91,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'set_audio_volume',
                    data: { id: '', volume: 1 },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.mute",
    icon: "mdi-volume-off",
    order: 92,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_mixer_change',
                    data: { id: '', isSelected: false },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.unmute",
    icon: "mdi-volume-high",
    order: 93,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_mixer_change',
                    data: { id: '', isSelected: true },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.setDelay",
    icon: "mdi-timer-outline",
    order: 94,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'set_audio_delay',
                    data: { id: '', delayTime: 0 },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.enableAfv",
    icon: "mdi-link-variant",
    order: 95,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'set_audio_afv',
                    data: { id: '', AFV: true },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.audioSource.title", icon: "mdi-tune-vertical" },
    ],
    titleKey: "macro.presets.yolobox.audioSource.disableAfv",
    icon: "mdi-link-variant-off",
    order: 96,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'set_audio_afv',
                    data: { id: '', AFV: false },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.streaming.title", icon: "mdi-broadcast" },
    ],
    titleKey: "macro.presets.yolobox.streaming.goLive",
    icon: "mdi-play-circle-outline",
    order: 97,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_live_status',
                    data: { status: 'start' },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.yolobox.title", icon: "mdi-video-wireless-outline" },
      { titleKey: "macro.presets.yolobox.streaming.title", icon: "mdi-broadcast" },
    ],
    titleKey: "macro.presets.yolobox.streaming.stopStream",
    icon: "mdi-stop-circle-outline",
    order: 98,
    create: () => ({ type: 'task', task: {
                    channel: 'yolobox',
                    method: 'order_live_status',
                    data: { status: 'stop' },
                  } }),
  },
]

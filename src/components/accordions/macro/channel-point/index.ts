export { default as MacroChannelPointAcceptTaskAccordion } from './MacroChannelPointAcceptTaskAccordion.vue'
export { default as MacroChannelPointCancelTaskAccordion } from './MacroChannelPointCancelTaskAccordion.vue'
export { default as MacroChannelPointDisableTaskAccordion } from './MacroChannelPointDisableTaskAccordion.vue'
export { default as MacroChannelPointEnableTaskAccordion } from './MacroChannelPointEnableTaskAccordion.vue'
export { default as MacroChannelPointPauseTaskAccordion } from './MacroChannelPointPauseTaskAccordion.vue'
export { default as MacroChannelPointSelect } from './MacroChannelPointSelect.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const channelPointMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
      { titleKey: "macro.presets.channelPoint.redemption", icon: "mdi-ticket-confirmation-outline" },
    ],
    titleKey: "macro.presets.channelPoint.acceptReward",
    icon: "mdi-check-circle-outline",
    order: 34,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'accept', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
      { titleKey: "macro.presets.channelPoint.redemption", icon: "mdi-ticket-confirmation-outline" },
    ],
    titleKey: "macro.presets.channelPoint.cancelReward",
    icon: "mdi-close-circle-outline",
    order: 35,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'cancel', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.channelPoint.pauseReward",
    icon: "mdi-pause-circle-outline",
    order: 36,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'pause', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.channelPoint.unpauseReward",
    icon: "mdi-play-circle-outline",
    order: 37,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'unpause', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.channelPoint.enableReward",
    icon: "mdi-toggle-switch",
    order: 39,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'enable', data: { name: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.channelPoint.title", icon: "mdi-star-circle" },
    ],
    titleKey: "macro.presets.channelPoint.disableReward",
    icon: "mdi-toggle-switch-off-outline",
    order: 40,
    create: () => ({ type: 'task', task: { channel: 'channel_point', method: 'disable', data: { name: '' } } }),
  },
]

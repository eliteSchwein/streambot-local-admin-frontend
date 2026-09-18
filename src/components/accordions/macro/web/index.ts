export { default as MacroRestTaskAccordion } from './MacroRestTaskAccordion.vue'
export { default as MacroWebhookTaskAccordion } from './MacroWebhookTaskAccordion.vue'
export { default as MacroWebsocketTaskAccordion } from './MacroWebsocketTaskAccordion.vue'
export { default as MacroWebsocketEnableElementTaskAccordion } from './MacroWebsocketEnableElementTaskAccordion.vue'
export { default as MacroWebsocketDisableElementTaskAccordion } from './MacroWebsocketDisableElementTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const webMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.webhook",
    icon: "mdi-webhook",
    order: 134,
    create: () => ({ type: 'task', task: { channel: 'webhook', method: 'post', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.visibility.title", icon: "mdi-eye-outline" },
    ],
    titleKey: "macro.presets.expert.visibility.show",
    icon: "mdi-eye-outline",
    order: 135,
    create: () => ({ type: 'task', task: { channel: 'websocket', method: 'notify_toggle_element', data: { target: '', action: 'enable' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.visibility.title", icon: "mdi-eye-outline" },
    ],
    titleKey: "macro.presets.expert.visibility.hide",
    icon: "mdi-eye-off-outline",
    order: 136,
    create: () => ({ type: 'task', task: { channel: 'websocket', method: 'notify_toggle_element', data: { target: '', action: 'disable' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.websocket",
    icon: "mdi-connection",
    order: 137,
    create: () => ({ type: 'task', task: { channel: 'websocket', method: '', data: {} } }),
  },
]

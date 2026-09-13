export { default as MacroRestTaskAccordion } from './MacroRestTaskAccordion.vue'
export { default as MacroWebhookTaskAccordion } from './MacroWebhookTaskAccordion.vue'
export { default as MacroWebsocketTaskAccordion } from './MacroWebsocketTaskAccordion.vue'

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
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.websocket",
    icon: "mdi-connection",
    order: 135,
    create: () => ({ type: 'task', task: { channel: 'websocket', method: '', data: {} } }),
  },
]

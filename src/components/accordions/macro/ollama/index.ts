export { default as MacroOllamaChatTaskAccordion } from './MacroOllamaChatTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const ollamaMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.message.title", icon: "mdi-forum-outline" },
    ],
    titleKey: "macro.core.ollamaChat.title",
    icon: "mdi-robot-outline",
    order: 23,
    ollamaOnly: true,
    create: () => ({ type: 'task', task: {
                channel: 'ollama',
                method: 'chat',
                data: {
                  messages: [
                    {
                      role: 'user',
                      content: '',
                    },
                  ],
                  result_variable: 'ollama_response',
                  timeout: 0,
                  strip_emojis: false,
                },
              } }),
  },
]

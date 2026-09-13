export { default as MacroFunctionAnnounceTaskAccordion } from './MacroFunctionAnnounceTaskAccordion.vue'
export { default as MacroFunctionBaseTaskAccordion } from './MacroFunctionBaseTaskAccordion.vue'
export { default as MacroFunctionDumpVariablesTaskAccordion } from './MacroFunctionDumpVariablesTaskAccordion.vue'
export { default as MacroFunctionParallelTaskAccordion } from './MacroFunctionParallelTaskAccordion.vue'
export { default as MacroFunctionRandomTaskAccordion } from './MacroFunctionRandomTaskAccordion.vue'
export { default as MacroFunctionSendDmTaskAccordion } from './MacroFunctionSendDmTaskAccordion.vue'
export { default as MacroFunctionSendMessageTaskAccordion } from './MacroFunctionSendMessageTaskAccordion.vue'
export { default as MacroFunctionSleepTaskAccordion } from './MacroFunctionSleepTaskAccordion.vue'
export { default as MacroFunctionSongRequestTaskAccordion } from './MacroFunctionSongRequestTaskAccordion.vue'
export { default as MacroFunctionSongRequestToggleTaskAccordion } from './MacroFunctionSongRequestToggleTaskAccordion.vue'
export { default as MacroFunctionSpeakTaskAccordion } from './MacroFunctionSpeakTaskAccordion.vue'
export { default as MacroFunctionStripEmojisTaskAccordion } from './MacroFunctionStripEmojisTaskAccordion.vue'
export { default as MacroFunctionTaskAccordion } from './MacroFunctionTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const functionsMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.conditions.title", icon: "mdi-source-branch" },
    ],
    titleKey: "macro.function.parallel.title",
    icon: "mdi-call-split",
    order: 3,
    create: () => ({ type: 'task', task: {
                channel: 'function',
                method: 'parallel',
                data: { tasks: [] },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.message.title", icon: "mdi-forum-outline" },
    ],
    titleKey: "macro.presets.message.sendDm",
    icon: "mdi-message-lock-outline",
    order: 19,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'send_dm', data: { user: '', content: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.message.title", icon: "mdi-forum-outline" },
    ],
    titleKey: "macro.presets.message.chatMessage",
    icon: "mdi-message-text-outline",
    order: 20,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'send_message', data: { content: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.message.title", icon: "mdi-forum-outline" },
    ],
    titleKey: "macro.presets.message.announce",
    icon: "mdi-bullhorn-outline",
    order: 21,
    create: () => ({ type: 'task', task: {
                channel: 'function',
                method: 'announce',
                data: {
                  content: '',
                  color: 'primary',
                },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.message.title", icon: "mdi-forum-outline" },
    ],
    titleKey: "macro.presets.message.stripEmojis",
    icon: "mdi-emoticon-remove-outline",
    order: 22,
    create: () => ({ type: 'task', task: {
                channel: 'function',
                method: 'strip_emojis',
                data: {
                  content: '',
                  key: 'stripped_text',
                },
              } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.sleep.title", icon: "mdi-timer-sand" },
    ],
    titleKey: "macro.presets.time.sleep1s",
    icon: "mdi-timer-sand",
    order: 24,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'sleep', data: { time: 1000 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.sleep.title", icon: "mdi-timer-sand" },
    ],
    titleKey: "macro.presets.time.sleep1min",
    icon: "mdi-timer-sand",
    order: 25,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'sleep', data: { time: 60000 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.sleep.title", icon: "mdi-timer-sand" },
    ],
    titleKey: "macro.presets.time.sleep5min",
    icon: "mdi-timer-sand",
    order: 26,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'sleep', data: { time: 300000 } } }),
  },
  {
    titleKey: "macro.presets.random",
    icon: "mdi-dice-multiple-outline",
    order: 32,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'random', data: { key: '', min: 0, max: 100 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.audio.speak",
    icon: "mdi-account-voice",
    order: 51,
    create: () => ({ type: 'task', task: { channel: 'function', method: 'speak', data: { content: '', event_uuid: "${eventUuid}" } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
    ],
    titleKey: "macro.presets.expert.dumpVariables",
    icon: "mdi-database-export-outline",
    order: 144,
    create: () => ({ type: 'task', task: {
                channel: 'function',
                method: 'dump_variables',
                data: {},
              } }),
  },
]

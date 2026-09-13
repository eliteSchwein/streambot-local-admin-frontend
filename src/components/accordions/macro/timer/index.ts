export { default as MacroTimerAddTimeTaskAccordion } from './MacroTimerAddTimeTaskAccordion.vue'
export { default as MacroTimerPauseTaskAccordion } from './MacroTimerPauseTaskAccordion.vue'
export { default as MacroTimerReduceTimeTaskAccordion } from './MacroTimerReduceTimeTaskAccordion.vue'
export { default as MacroTimerStartTaskAccordion } from './MacroTimerStartTaskAccordion.vue'
export { default as MacroTimerStopTaskAccordion } from './MacroTimerStopTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const timerMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.timer.title", icon: "mdi-timer-outline" },
    ],
    titleKey: "macro.final.timer.actions.start",
    icon: "mdi-timer-play",
    order: 27,
    create: () => ({ type: 'task', task: { channel: 'timer', method: 'start', data: { time: 10, unit: 'seconds', end: 'blink' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.timer.title", icon: "mdi-timer-outline" },
    ],
    titleKey: "macro.final.timer.actions.addTime",
    icon: "mdi-timer-plus-outline",
    order: 28,
    create: () => ({ type: 'task', task: { channel: 'timer', method: 'add_time', data: { time: 1, unit: 'seconds' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.timer.title", icon: "mdi-timer-outline" },
    ],
    titleKey: "macro.final.timer.actions.reduceTime",
    icon: "mdi-timer-minus-outline",
    order: 29,
    create: () => ({ type: 'task', task: { channel: 'timer', method: 'reduce_time', data: { time: 1, unit: 'seconds' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.timer.title", icon: "mdi-timer-outline" },
    ],
    titleKey: "macro.final.timer.actions.pause",
    icon: "mdi-pause-circle-outline",
    order: 30,
    create: () => ({ type: 'task', task: { channel: 'timer', method: 'pause', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.time.title", icon: "mdi-clock-time-eight" },
      { titleKey: "macro.presets.time.timer.title", icon: "mdi-timer-outline" },
    ],
    titleKey: "macro.final.timer.actions.stop",
    icon: "mdi-stop-circle-outline",
    order: 31,
    create: () => ({ type: 'task', task: { channel: 'timer', method: 'stop', data: {} } }),
  },
]

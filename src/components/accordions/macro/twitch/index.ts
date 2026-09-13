export { default as MacroTwitchAdTaskAccordion } from './MacroTwitchAdTaskAccordion.vue'
export { default as MacroTwitchBanTaskAccordion } from './MacroTwitchBanTaskAccordion.vue'
export { default as MacroTwitchCategoryTaskAccordion } from './MacroTwitchCategoryTaskAccordion.vue'
export { default as MacroTwitchClipTaskAccordion } from './MacroTwitchClipTaskAccordion.vue'
export { default as MacroTwitchDisableRandomClipTaskAccordion } from './MacroTwitchDisableRandomClipTaskAccordion.vue'
export { default as MacroTwitchEnableRandomClipTaskAccordion } from './MacroTwitchEnableRandomClipTaskAccordion.vue'
export { default as MacroTwitchPollArchiveTaskAccordion } from './MacroTwitchPollArchiveTaskAccordion.vue'
export { default as MacroTwitchPollCreateTaskAccordion } from './MacroTwitchPollCreateTaskAccordion.vue'
export { default as MacroTwitchPollTerminateTaskAccordion } from './MacroTwitchPollTerminateTaskAccordion.vue'
export { default as MacroTwitchPredictionCancelTaskAccordion } from './MacroTwitchPredictionCancelTaskAccordion.vue'
export { default as MacroTwitchPredictionCreateTaskAccordion } from './MacroTwitchPredictionCreateTaskAccordion.vue'
export { default as MacroTwitchPredictionLockTaskAccordion } from './MacroTwitchPredictionLockTaskAccordion.vue'
export { default as MacroTwitchPredictionResolveTaskAccordion } from './MacroTwitchPredictionResolveTaskAccordion.vue'
export { default as MacroTwitchShoutoutTaskAccordion } from './MacroTwitchShoutoutTaskAccordion.vue'
export { default as MacroTwitchStreamMarkerTaskAccordion } from './MacroTwitchStreamMarkerTaskAccordion.vue'
export { default as MacroTwitchTimeoutTaskAccordion } from './MacroTwitchTimeoutTaskAccordion.vue'
export { default as MacroTwitchVipAddTaskAccordion } from './MacroTwitchVipAddTaskAccordion.vue'
export { default as MacroTwitchVipRemoveTaskAccordion } from './MacroTwitchVipRemoveTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const twitchMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.clips.title", icon: "mdi-movie-open-outline" },
    ],
    titleKey: "macro.presets.twitch.createClip",
    icon: "mdi-content-cut",
    order: 69,
    create: () => ({ type: 'task', task: {
                    channel: 'twitch',
                    method: 'clip',
                    data: {
                      create_after_delay: false,
                      wait_seconds: 35,
                      variable: 'clip',
                    },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.clips.title", icon: "mdi-movie-open-outline" },
    ],
    titleKey: "macro.twitch.randomClip.enableTitle",
    icon: "mdi-movie-open-play",
    order: 70,
    create: () => ({ type: 'task', task: {
                    channel: 'twitch',
                    method: 'enable_random_clip',
                    data: {
                      channel: '',
                      mode: 'random',
                      recent_clips: 0,
                      max_length: 60,
                      filter_long_videos: false,
                      info: false,
                      show_timer: false,
                      volume: 50,
                      variable: 'random_clip',
                    },
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.clips.title", icon: "mdi-movie-open-outline" },
    ],
    titleKey: "macro.twitch.randomClip.disableTitle",
    icon: "mdi-movie-open-off",
    order: 71,
    create: () => ({ type: 'task', task: {
                    channel: 'twitch',
                    method: 'disable_random_clip',
                    data: {},
                  } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
    ],
    titleKey: "macro.presets.twitch.shoutout",
    icon: "mdi-account-voice",
    order: 72,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'shoutout', data: { user: '', variable: 'shoutout' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
    ],
    titleKey: "macro.presets.twitch.changeCategory",
    icon: "mdi-gamepad-variant-outline",
    order: 73,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'set_category', data: { category: '', variable: 'category' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.polls.title", icon: "mdi-poll" },
    ],
    titleKey: "macro.presets.twitch.polls.createPoll",
    icon: "mdi-plus-circle-outline",
    order: 74,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'poll', data: { action: 'create', title: '', choices: '', duration: 60, channel_points_voting: false, points_per_vote: 1, variable: 'poll' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.polls.title", icon: "mdi-poll" },
    ],
    titleKey: "macro.presets.twitch.polls.archivePoll",
    icon: "mdi-archive-outline",
    order: 75,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'poll', data: { action: 'archive', poll_id: '', variable: 'poll' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.polls.title", icon: "mdi-poll" },
    ],
    titleKey: "macro.presets.twitch.polls.terminatePoll",
    icon: "mdi-close-octagon-outline",
    order: 76,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'poll', data: { action: 'terminate', poll_id: '', variable: 'poll' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.predictions.title", icon: "mdi-crystal-ball" },
    ],
    titleKey: "macro.presets.twitch.predictions.createPrediction",
    icon: "mdi-plus-circle-outline",
    order: 77,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'prediction', data: { action: 'create', title: '', outcomes: '', duration: 120, variable: 'prediction' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.predictions.title", icon: "mdi-crystal-ball" },
    ],
    titleKey: "macro.presets.twitch.predictions.lockPrediction",
    icon: "mdi-lock-outline",
    order: 78,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'prediction', data: { action: 'lock', prediction_id: '', variable: 'prediction' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.predictions.title", icon: "mdi-crystal-ball" },
    ],
    titleKey: "macro.presets.twitch.predictions.resolvePrediction",
    icon: "mdi-check-decagram-outline",
    order: 79,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'prediction', data: { action: 'resolve', prediction_id: '', winning_outcome_id: '', variable: 'prediction' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.predictions.title", icon: "mdi-crystal-ball" },
    ],
    titleKey: "macro.presets.twitch.predictions.cancelPrediction",
    icon: "mdi-cancel",
    order: 80,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'prediction', data: { action: 'cancel', prediction_id: '', variable: 'prediction' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
    ],
    titleKey: "macro.presets.twitch.createStreamMarker",
    icon: "mdi-map-marker-plus-outline",
    order: 81,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'stream_marker', data: { description: '', variable: 'stream_marker' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.vip.title", icon: "mdi-star-outline" },
    ],
    titleKey: "macro.presets.twitch.vip.addVip",
    icon: "mdi-star-plus-outline",
    order: 82,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'vip', data: { action: 'add', user: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.vip.title", icon: "mdi-star-outline" },
    ],
    titleKey: "macro.presets.twitch.vip.removeVip",
    icon: "mdi-star-minus-outline",
    order: 83,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'vip', data: { action: 'remove', user: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.moderation.title", icon: "mdi-shield-account-outline" },
    ],
    titleKey: "macro.presets.twitch.moderation.banUser",
    icon: "mdi-account-cancel",
    order: 84,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'ban', data: { user: '', reason: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
      { titleKey: "macro.presets.twitch.moderation.title", icon: "mdi-shield-account-outline" },
    ],
    titleKey: "macro.presets.twitch.moderation.timeoutUser",
    icon: "mdi-account-clock",
    order: 85,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'timeout', data: { user: '', duration: 600, reason: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.twitch.title", icon: "mdi-twitch" },
    ],
    titleKey: "macro.presets.twitch.runAd",
    icon: "mdi-advertisements",
    order: 86,
    create: () => ({ type: 'task', task: { channel: 'twitch', method: 'ad', data: { duration: 30, variable: 'ad' } } }),
  },
]

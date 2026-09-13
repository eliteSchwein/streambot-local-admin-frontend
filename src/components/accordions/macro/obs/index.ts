export { default as MacroObsDisableSourceFilterTaskAccordion } from './MacroObsDisableSourceFilterTaskAccordion.vue'
export { default as MacroObsEnableSourceFilterTaskAccordion } from './MacroObsEnableSourceFilterTaskAccordion.vue'
export { default as MacroObsHideSceneItemTaskAccordion } from './MacroObsHideSceneItemTaskAccordion.vue'
export { default as MacroObsLockSceneItemTaskAccordion } from './MacroObsLockSceneItemTaskAccordion.vue'
export { default as MacroObsMuteInputTaskAccordion } from './MacroObsMuteInputTaskAccordion.vue'
export { default as MacroObsPauseRecordTaskAccordion } from './MacroObsPauseRecordTaskAccordion.vue'
export { default as MacroObsReloadBrowserSourcesTaskAccordion } from './MacroObsReloadBrowserSourcesTaskAccordion.vue'
export { default as MacroObsResumeRecordTaskAccordion } from './MacroObsResumeRecordTaskAccordion.vue'
export { default as MacroObsSaveReplayBufferTaskAccordion } from './MacroObsSaveReplayBufferTaskAccordion.vue'
export { default as MacroObsScreenshotTaskAccordion } from './MacroObsScreenshotTaskAccordion.vue'
export { default as MacroObsSetInputMuteTaskAccordion } from './MacroObsSetInputMuteTaskAccordion.vue'
export { default as MacroObsSetInputVolumeTaskAccordion } from './MacroObsSetInputVolumeTaskAccordion.vue'
export { default as MacroObsSetProfileTaskAccordion } from './MacroObsSetProfileTaskAccordion.vue'
export { default as MacroObsSetSceneCollectionTaskAccordion } from './MacroObsSetSceneCollectionTaskAccordion.vue'
export { default as MacroObsShowSceneItemTaskAccordion } from './MacroObsShowSceneItemTaskAccordion.vue'
export { default as MacroObsStartRecordTaskAccordion } from './MacroObsStartRecordTaskAccordion.vue'
export { default as MacroObsStartReplayBufferTaskAccordion } from './MacroObsStartReplayBufferTaskAccordion.vue'
export { default as MacroObsStartStreamTaskAccordion } from './MacroObsStartStreamTaskAccordion.vue'
export { default as MacroObsStopRecordTaskAccordion } from './MacroObsStopRecordTaskAccordion.vue'
export { default as MacroObsStopReplayBufferTaskAccordion } from './MacroObsStopReplayBufferTaskAccordion.vue'
export { default as MacroObsStopStreamTaskAccordion } from './MacroObsStopStreamTaskAccordion.vue'
export { default as MacroObsSwitchPreviewSceneTaskAccordion } from './MacroObsSwitchPreviewSceneTaskAccordion.vue'
export { default as MacroObsSwitchSceneTaskAccordion } from './MacroObsSwitchSceneTaskAccordion.vue'
export { default as MacroObsTaskAccordion } from './MacroObsTaskAccordion.vue'
export { default as MacroObsToggleInputMuteTaskAccordion } from './MacroObsToggleInputMuteTaskAccordion.vue'
export { default as MacroObsToggleSceneItemTaskAccordion } from './MacroObsToggleSceneItemTaskAccordion.vue'
export { default as MacroObsTransformSceneItemTaskAccordion } from './MacroObsTransformSceneItemTaskAccordion.vue'
export { default as MacroObsTransitionSourceFilterTaskAccordion } from './MacroObsTransitionSourceFilterTaskAccordion.vue'
export { default as MacroObsTriggerHotkeyTaskAccordion } from './MacroObsTriggerHotkeyTaskAccordion.vue'
export { default as MacroObsUnlockSceneItemTaskAccordion } from './MacroObsUnlockSceneItemTaskAccordion.vue'
export { default as MacroObsUnmuteInputTaskAccordion } from './MacroObsUnmuteInputTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const obsMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.scenes.title", icon: "mdi-monitor-screenshot" },
    ],
    titleKey: "macro.presets.obs.scenes.switchScene",
    icon: "mdi-monitor-screenshot",
    order: 99,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetCurrentProgramScene', data: { sceneName: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.scenes.title", icon: "mdi-monitor-screenshot" },
    ],
    titleKey: "macro.presets.obs.scenes.switchPreviewScene",
    icon: "mdi-monitor-eye",
    order: 100,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetCurrentPreviewScene', data: { sceneName: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.sceneItems.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.obs.sceneItems.showSceneItem",
    icon: "mdi-eye",
    order: 101,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSceneItemEnabled', data: { sceneName: '', sceneItemId: null, sceneItemEnabled: true } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.sceneItems.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.obs.sceneItems.hideSceneItem",
    icon: "mdi-eye-off",
    order: 102,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSceneItemEnabled', data: { sceneName: '', sceneItemId: null, sceneItemEnabled: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.sceneItems.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.obs.sceneItems.lockSceneItem",
    icon: "mdi-lock",
    order: 103,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSceneItemLocked', data: { sceneName: '', sceneItemId: null, sceneItemLocked: true } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.sceneItems.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.obs.sceneItems.unlockSceneItem",
    icon: "mdi-lock-open-variant",
    order: 104,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSceneItemLocked', data: { sceneName: '', sceneItemId: null, sceneItemLocked: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.sceneItems.title", icon: "mdi-layers-outline" },
    ],
    titleKey: "macro.presets.obs.sceneItems.transformSceneItem",
    icon: "mdi-vector-square",
    order: 105,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSceneItemTransform', data: { sceneName: '', sceneItemId: null, sceneItemTransform: { positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotation: 0 } } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.audio.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.obs.audio.muteInput",
    icon: "mdi-volume-off",
    order: 106,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetInputMute', data: { inputName: '', inputMuted: true } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.audio.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.obs.audio.unmuteInput",
    icon: "mdi-volume-high",
    order: 107,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetInputMute', data: { inputName: '', inputMuted: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.audio.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.obs.audio.toggleInputMute",
    icon: "mdi-volume-medium",
    order: 108,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'ToggleInputMute', data: { inputName: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.audio.title", icon: "mdi-volume-high" },
    ],
    titleKey: "macro.presets.obs.audio.setInputVolume",
    icon: "mdi-volume-source",
    order: 109,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetInputVolume', data: { inputName: '', inputVolumeDb: 0 } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.filters.title", icon: "mdi-filter" },
    ],
    titleKey: "macro.presets.obs.filters.enableSourceFilter",
    icon: "mdi-filter-check",
    order: 110,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSourceFilterEnabled', data: { sourceName: '', filterName: '', filterEnabled: true } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.filters.title", icon: "mdi-filter" },
    ],
    titleKey: "macro.presets.obs.filters.disableSourceFilter",
    icon: "mdi-filter-off",
    order: 111,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetSourceFilterEnabled', data: { sourceName: '', filterName: '', filterEnabled: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.filters.title", icon: "mdi-filter" },
    ],
    titleKey: "macro.presets.obs.filters.transitionSourceFilter",
    icon: "mdi-transition",
    order: 112,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'transition_source_filter', data: { sourceName: '', filterName: '', duration: 1, start: {}, end: {} } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.streaming.title", icon: "mdi-broadcast" },
    ],
    titleKey: "macro.presets.obs.streaming.startStream",
    icon: "mdi-broadcast",
    order: 113,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StartStream', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.streaming.title", icon: "mdi-broadcast" },
    ],
    titleKey: "macro.presets.obs.streaming.stopStream",
    icon: "mdi-broadcast-off",
    order: 114,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StopStream', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.recording.startRecording",
    icon: "mdi-record-rec",
    order: 116,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StartRecord', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.recording.stopRecording",
    icon: "mdi-stop-circle",
    order: 117,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StopRecord', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.recording.pauseRecording",
    icon: "mdi-pause-circle",
    order: 119,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'PauseRecord', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.recording.resumeRecording",
    icon: "mdi-play-circle",
    order: 120,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'ResumeRecord', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.tools.sourceScreenshot",
    icon: "mdi-camera",
    order: 121,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'GetSourceScreenshot', data: { sourceName: '', imageFormat: 'png', resultVariable: 'screenshot' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.recording.title", icon: "mdi-record-rec" },
    ],
    titleKey: "macro.presets.obs.tools.outputScreenshot",
    icon: "mdi-monitor-screenshot",
    order: 122,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'get_output_screenshot', data: { imageFormat: 'png', resultVariable: 'screenshot' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.replayBuffer.title", icon: "mdi-history" },
    ],
    titleKey: "macro.presets.obs.replayBuffer.startReplayBuffer",
    icon: "mdi-history",
    order: 123,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StartReplayBuffer', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.replayBuffer.title", icon: "mdi-history" },
    ],
    titleKey: "macro.presets.obs.replayBuffer.stopReplayBuffer",
    icon: "mdi-history",
    order: 124,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'StopReplayBuffer', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.replayBuffer.title", icon: "mdi-history" },
    ],
    titleKey: "macro.presets.obs.replayBuffer.saveReplayBuffer",
    icon: "mdi-content-save",
    order: 125,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SaveReplayBuffer', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.tools.title", icon: "mdi-tools" },
    ],
    titleKey: "macro.presets.obs.tools.reloadBrowserSources",
    icon: "mdi-refresh",
    order: 126,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'reload_browser_sources', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.tools.title", icon: "mdi-tools" },
    ],
    titleKey: "macro.presets.obs.tools.triggerHotkey",
    icon: "mdi-keyboard",
    order: 127,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'TriggerHotkeyByName', data: { hotkeyName: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.tools.title", icon: "mdi-tools" },
    ],
    titleKey: "macro.presets.obs.tools.setProfile",
    icon: "mdi-account-cog",
    order: 128,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetCurrentProfile', data: { profileName: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.obs.title", icon: "mdi-broadcast" },
      { titleKey: "macro.presets.obs.tools.title", icon: "mdi-tools" },
    ],
    titleKey: "macro.presets.obs.tools.setSceneCollection",
    icon: "mdi-folder-cog",
    order: 129,
    create: () => ({ type: 'task', task: { channel: 'obs', method: 'SetCurrentSceneCollection', data: { sceneCollectionName: '' } } }),
  },
]

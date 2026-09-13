export { default as MacroMusicLoopFileTaskAccordion } from './MacroMusicLoopFileTaskAccordion.vue'
export { default as MacroMusicLoopTaskAccordion } from './MacroMusicLoopTaskAccordion.vue'
export { default as MacroMusicNextTaskAccordion } from './MacroMusicNextTaskAccordion.vue'
export { default as MacroMusicPauseTaskAccordion } from './MacroMusicPauseTaskAccordion.vue'
export { default as MacroMusicPlaySongTaskAccordion } from './MacroMusicPlaySongTaskAccordion.vue'
export { default as MacroMusicPlayTaskAccordion } from './MacroMusicPlayTaskAccordion.vue'
export { default as MacroMusicPreviousTaskAccordion } from './MacroMusicPreviousTaskAccordion.vue'
export { default as MacroMusicReloadTaskAccordion } from './MacroMusicReloadTaskAccordion.vue'
export { default as MacroMusicShuffleTaskAccordion } from './MacroMusicShuffleTaskAccordion.vue'
export { default as MacroMusicSongRequestTaskAccordion } from './MacroMusicSongRequestTaskAccordion.vue'
export { default as MacroMusicStopTaskAccordion } from './MacroMusicStopTaskAccordion.vue'
export { default as MacroMusicTaskAccordion } from './MacroMusicTaskAccordion.vue'
export { default as MacroMusicTogglePauseTaskAccordion } from './MacroMusicTogglePauseTaskAccordion.vue'
export { default as MacroMusicToggleSongRequestsTaskAccordion } from './MacroMusicToggleSongRequestsTaskAccordion.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const musicMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.play",
    icon: "mdi-play",
    order: 55,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'play', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.pause",
    icon: "mdi-pause",
    order: 56,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'pause', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.togglePlayPause",
    icon: "mdi-play-pause",
    order: 57,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'toggle_pause', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.previousSong",
    icon: "mdi-skip-previous",
    order: 58,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'back', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.nextSong",
    icon: "mdi-skip-next",
    order: 59,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'next', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.stop",
    icon: "mdi-stop",
    order: 60,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'stop', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.shuffle",
    icon: "mdi-shuffle-variant",
    order: 61,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'shuffle', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.loopPlaylist",
    icon: "mdi-repeat",
    order: 62,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'loop', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.loopCurrentSong",
    icon: "mdi-repeat-once",
    order: 63,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'loop_file', data: {} } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.playSpecificSong",
    icon: "mdi-music-note",
    order: 64,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'play_song', data: { song: '', continue: true, restart: true, pause: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.musicControl.title", icon: "mdi-music" },
    ],
    titleKey: "macro.presets.audio.musicControl.reloadPlayer",
    icon: "mdi-refresh",
    order: 65,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'reload', data: { restore_state: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.songRequestControl.title", icon: "mdi-music-note-plus" },
    ],
    titleKey: "macro.presets.audio.songRequestControl.addSongRequest",
    icon: "mdi-music-note-plus",
    order: 67,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'song_request', data: { url: '' } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.audio.title", icon: "mdi-volume-high" },
      { titleKey: "macro.presets.audio.songRequestControl.title", icon: "mdi-music-note-plus" },
    ],
    titleKey: "macro.presets.audio.songRequestControl.toggleSongRequests",
    icon: "mdi-music-note-off-outline",
    order: 68,
    create: () => ({ type: 'task', task: { channel: 'music', method: 'song_request_toggle', data: {} } }),
  },
]

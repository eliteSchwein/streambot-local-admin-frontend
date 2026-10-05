<template>
  <v-card
    class="music-controls"
    color="grey-darken-3"
    rounded
  >
    <v-card-title>
      {{ $t('music.title') }}
    </v-card-title>

    <v-card-text class="pt-0">
      <div class="music-player">
        <div class="music-player__header">
          <div class="music-player__track">
            <div class="text-subtitle-1 font-weight-bold text-truncate">
              {{ music.title || $t('music.noSong') }}
            </div>

            <div class="text-body-2 text-medium-emphasis text-truncate">
              {{ music.artist || $t('music.unknownArtist') }}
            </div>
          </div>

          <v-switch
            class="music-player__song-requests"
            density="compact"
            :label="$t('music.songRequests')"
            :model-value="music?.songrequest?.enabled ?? false"
            @click="toggleSongRequest"
            hide-details
          />
        </div>

        <div class="music-player__controls">
          <div
            class="music-player__visualizer"
            aria-hidden="true"
          >
            <div
              v-for="(value, index) in smoothedCavaValues"
              :key="index"
              class="music-player__visualizer-bar"
              :style="{ height: getCavaBarHeight(value) }"
            />
          </div>

          <v-btn
            icon="mdi-shuffle-variant"
            size="40"
            :color="isShuffleEnabled ? 'primary' : undefined"
            @click="callMusicApi('shuffle')"
          />
          <v-btn
            icon="mdi-skip-previous"
            size="40"
            @click="callMusicApi('back')"
          />
          <v-btn
            class="music-player__main-button"
            :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
            color="primary"
            size="46"
            @click="callMusicApi(isPlaying ? 'pause' : 'play')"
          />
          <v-btn
            icon="mdi-skip-next"
            size="40"
            @click="callMusicApi('next')"
          />
          <v-btn
            icon="mdi-repeat"
            size="40"
            :color="isLoopEnabled ? 'primary' : undefined"
            @click="callMusicApi('loop')"
          />
        </div>

        <div class="music-player__progress">
          <v-progress-linear
            :model-value="music.progress_percentage ?? 0"
            color="primary"
            height="7"
            rounded
          />

          <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
            <span>{{ formatTime(music.position) }}</span>
            <span>{{ formatTime(music.duration) }}</span>
          </div>
        </div>
      </div>

      <div class="music-playlist">
        <div class="music-playlist__header">
          <div class="text-subtitle-2 font-weight-medium">
            {{ isSongRequestEnabled ? $t('music.songRequests') : $t('music.playlist') }}
          </div>

          <div class="text-caption text-medium-emphasis">
            {{ $t('music.songCount', { count: playlistLength }) }}
          </div>
        </div>

        <v-list
          ref="playlistList"
          density="compact"
          bg-color="transparent"
          class="music-playlist-list"
        >
          <v-list-item
            v-for="item in playlist"
            :key="item.id ?? item.filename"
            :title="getFilename(item)"
            :active="isCurrentSong(item)"
            :class="{ 'current-song': isCurrentSong(item) }"
            :ref="el => setPlaylistItemRef(el, item)"
            rounded="lg"
          >
            <template #append>
              <div class="d-flex align-center ga-1">
                <v-btn
                  v-if="!isCurrentSong(item)"
                  icon="mdi-play"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="playSong(item)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteSong(item)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>


<script lang="ts">
import { defineComponent, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import {getWebsocketClient} from "@/plugins/websocketInstance.ts";

export default defineComponent({
  name: 'MusicControls',

  data() {
    return {
      playlistItemRefs: {} as Record<string, any>,
      cavaBuffer: '',
      cavaValues: [] as number[],
      smoothedCavaValues: [] as number[],
      cavaSmoothing: 0.45,
      cavaFalloff: 6,
      cavaSocket: undefined as WebSocket | undefined,
      cavaReconnectTimer: undefined as number | undefined,
      cavaUnmounted: false,
    }
  },

  computed: {
    appStore(): ReturnType<typeof useAppStore> {
      return useAppStore()
    },

    music(): any {
      return this.appStore.getMusicData ?? {}
    },

    cavaBarCount(): number {
      return 5
    },

    getWebsocket(): string {
      return this.appStore.getWebsocket ?? ''
    },

    playlistResponse(): any {
      return this.appStore.getMusicPlaylist ?? {}
    },

    isSongRequestEnabled(): boolean {
      return this.music?.songrequest?.enabled === true
    },

    songRequestFiles(): any[] {
      const songrequest = this.music?.songrequest ?? {}
      const candidates = [
        songrequest.files,
        songrequest.playlist,
        songrequest.queue,
        songrequest.requests,
        songrequest.songs,
      ]

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate
      }

      return []
    },

    playlist(): any[] {
      return this.playlistResponse?.files ?? []
    },

    playlistLength(): number {
      return this.playlistResponse?.playlist_length ?? this.music.playlist_length ?? this.playlist.length
    },

    isPlaying(): boolean {
      return this.music.status === 'playing'
    },

    isShuffleEnabled(): boolean {
      return this.music.shuffle === true
    },

    isLoopEnabled(): boolean {
      return this.music.loop === true || this.music.loop_file === true
    },

    currentTrackKey(): string {
      return [
        this.music?.track?.path ?? '',
        this.music?.track?.filename ?? '',
        this.music?.track?.title ?? '',
        this.music?.filename ?? '',
        this.music?.path ?? '',
        this.music?.title ?? '',
      ].join('|')
    },
  },

  watch: {
    cavaBarCount: {
      immediate: true,
      handler(count: number) {
        this.ensureCavaBars(count)
      },
    },

    getWebsocket() {
      if (this.cavaUnmounted) return
      this.disconnectCavaSocket()
      this.connectCavaSocket()
    },

    currentTrackKey: {
      immediate: true,
      handler() {
        void nextTick(() => this.scrollToCurrentSong())
      },
    },

    playlist: {
      deep: true,
      handler() {
        void nextTick(() => this.scrollToCurrentSong())
      },
    },

    isSongRequestEnabled() {
      void nextTick(() => this.scrollToCurrentSong())
    },

    songRequestFiles: {
      deep: true,
      handler() {
        if (!this.isSongRequestEnabled) return
        void nextTick(() => this.scrollToCurrentSong())
      },
    },
  },

  mounted() {
    this.ensureCavaBars(this.cavaBarCount)
    this.cavaUnmounted = false
    this.connectCavaSocket()

    void nextTick(() => this.scrollToCurrentSong())
  },

  beforeUnmount() {
    this.cavaUnmounted = true
    this.disconnectCavaSocket()
  },

  methods: {
    getCavaWebsocketUrl(target = 'music_preview') {
      const base = String(this.getWebsocket || '').replace(/\/+$/, '')
      return `${base}/cava/${encodeURIComponent(target)}`
    },

    connectCavaSocket() {
      if (this.cavaUnmounted || typeof WebSocket === 'undefined') return

      if (this.cavaReconnectTimer !== undefined) {
        window.clearTimeout(this.cavaReconnectTimer)
        this.cavaReconnectTimer = undefined
      }

      const current = this.cavaSocket
      if (current && (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING)) return

      const socket = new WebSocket(this.getCavaWebsocketUrl('music_preview'))
      this.cavaSocket = socket

      socket.onmessage = event => {
        if (this.cavaSocket !== socket || typeof event.data !== 'string') return

        let message: any
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message?.method !== 'notify_music_cava') return

        const data = message?.params ?? {}
        if (String(data?.target ?? '').trim() !== 'music_preview') return

        this.handleCavaData(data)
      }

      socket.onclose = () => {
        if (this.cavaSocket === socket) this.cavaSocket = undefined
        this.scheduleCavaReconnect()
      }

      socket.onerror = () => {
        // Closing here ensures the normal reconnect path runs for failed/half-open sockets.
        try { socket.close() } catch {}
      }
    },

    scheduleCavaReconnect() {
      if (this.cavaUnmounted || this.cavaReconnectTimer !== undefined) return

      this.cavaReconnectTimer = window.setTimeout(() => {
        this.cavaReconnectTimer = undefined
        this.connectCavaSocket()
      }, 2000)
    },

    disconnectCavaSocket() {
      if (this.cavaReconnectTimer !== undefined) {
        window.clearTimeout(this.cavaReconnectTimer)
        this.cavaReconnectTimer = undefined
      }

      const socket = this.cavaSocket
      this.cavaSocket = undefined
      if (!socket) return

      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      try { socket.close() } catch {}
    },

    sendMusicWebsocket(method: string, params: Record<string, any> = {}) {
      void getWebsocketClient()?.send(method, params)
    },

    handleCavaData(data: any) {
      const frames = this.parseCavaFrames(String(data?.raw ?? ''))
      const barCount = this.cavaBarCount

      for (const values of frames) {
        if (!values.length) continue

        const normalizedValues = values.slice(0, barCount)

        while (normalizedValues.length < barCount) {
          normalizedValues.push(0)
        }

        this.cavaValues = normalizedValues
        this.smoothCavaValues()
      }
    },

    parseCavaFrames(raw: string): number[][] {
      if (!raw) return []

      this.cavaBuffer += raw

      const lines = this.cavaBuffer.split(/\r?\n/)
      this.cavaBuffer = lines.pop() ?? ''

      return lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const values = line
            .split(/[;,\s]+/)
            .map(value => Number(value))
            .filter(value => Number.isFinite(value))
            .map(value => Math.max(0, Math.min(100, value)))

          return values.length > 1 ? values.slice(0, -1) : values
        })
        .filter(values => values.length > 0)
    },

    ensureCavaBars(count: number) {
      if (this.smoothedCavaValues.length === count) return
      this.smoothedCavaValues = new Array(count).fill(0)
    },

    smoothCavaValues() {
      const smoothed = [...this.smoothedCavaValues]

      for (let i = 0; i < this.cavaBarCount; i++) {
        const target = this.cavaValues[i] ?? 0
        const current = smoothed[i] ?? 0

        if (target > current) {
          smoothed[i] = current + (target - current) * this.cavaSmoothing
        } else {
          smoothed[i] = Math.max(target, current - this.cavaFalloff)
        }
      }

      this.smoothedCavaValues = smoothed
    },

    getCavaBarHeight(value: number): string {
      return value > 0
        ? `${Math.max(3, value)}%`
        : '0%'
    },

    getItemPath(item: any): string {
      return item?.path ?? item?.filename ?? item?.file ?? item?.song?.path ?? item?.song?.filename ?? ''
    },

    getCurrentPath(): string {
      return this.music?.track?.path ?? this.music?.track?.filename ?? this.music?.path ?? this.music?.filename ?? ''
    },

    normalizePath(value: string): string {
      return String(value ?? '').replace(/\\/g, '/').trim()
    },

    getBasename(value: string): string {
      return this.normalizePath(value).split('/').filter(Boolean).pop() ?? this.normalizePath(value)
    },

    isCurrentSong(item: any): boolean {
      const itemPath = this.normalizePath(this.getItemPath(item))
      const currentPath = this.normalizePath(this.getCurrentPath())

      if (!itemPath || !currentPath) return false

      return itemPath === currentPath || this.getBasename(itemPath) === this.getBasename(currentPath)
    },

    setPlaylistItemRef(el: any, item: any) {
      const key = this.getFilename(item)
      if (!key) return

      if (el) {
        this.playlistItemRefs[key] = el
      } else {
        delete this.playlistItemRefs[key]
      }
    },

    scrollToCurrentSong() {
      const current = this.playlist.find(item => this.isCurrentSong(item))
      if (!current) return

      const key = this.getFilename(current)
      const itemRef = this.playlistItemRefs[key]
      const element = itemRef?.$el ?? itemRef

      element?.scrollIntoView?.({
        block: 'center',
        behavior: 'smooth',
      })
    },

    callMusicApi(action: string) {
      if (!this.getWebsocket) return

      this.sendMusicWebsocket(this.getMusicWebsocketMethod(action))
    },

    getMusicWebsocketMethod(action: string): string {
      return `music_${String(action ?? '').replace(/-/g, '_')}`
    },

    formatTime(ms: number = 0): string {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const rest = seconds % 60

      return `${minutes}:${String(rest).padStart(2, '0')}`
    },

    getFilename(item: any): string {
      if (typeof item === "string") {
        return this.getBasename(item)
      }

      const file = this.getItemPath(item)
      const basename = this.getBasename(file)

      return basename || item?.title || item?.song?.title || String(this.$t('music.unknownSong'))
    },

    async playSong(item: any) {
      if (!this.getWebsocket || this.isCurrentSong(item)) return

      const path = this.getItemPath(item)
      const filename = path || item?.filename || item?.song?.filename

      this.sendMusicWebsocket('music_play_song', {
        ...item,
        filename,
        path,
      })
    },

    async deleteSong(item: any) {
      if (!this.getWebsocket) return

      const filename = this.getFilename(item)

      this.sendMusicWebsocket('music_delete', { filename })
    },

    async toggleSongRequest() {
      if (!this.getWebsocket) return

      this.sendMusicWebsocket('music_songrequest_toggle')
    },

    resetCava() {
      this.cavaBuffer = ''
      this.cavaValues = []
      this.smoothedCavaValues = []
    },
  },
})
</script>

<style scoped>
.music-controls {
  width: 100%;
  overflow: hidden;
}

.music-player {
  position: relative;
  padding: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
}

.music-player::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -70px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.10);
  filter: blur(42px);
  pointer-events: none;
}

.music-player__header,
.music-player__controls,
.music-player__progress {
  position: relative;
  z-index: 1;
}

.music-player__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.music-player__track {
  min-width: 0;
  flex: 1;
}

.music-player__song-requests {
  flex: 0 0 auto;
}

.music-player__controls {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 18px;
  min-height: 46px;
}

.music-player__visualizer {
  position: absolute;
  left: 2px;
  width: 30px;
  height: 36px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 10px;
}

.music-player__visualizer-bar {
  width: 3px;
  min-height: 3px;
  max-height: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  transition: height 16ms linear;
}

.music-player__main-button {
  box-shadow: 0 5px 14px rgba(var(--v-theme-primary), 0.22);
}

.music-player__progress {
  margin-top: 16px;
}

.music-playlist {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.music-playlist__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px 6px;
}

.music-playlist-list {
  max-height: calc(100vh - 395px);
  overflow-y: auto;
}

.current-song {
  background: rgba(var(--v-theme-primary), 0.10);
}

@media (max-width: 390px) {
  .music-player {
    padding: 14px;
  }

  .music-player__controls {
    gap: 5px;
  }

  .music-player__visualizer {
    width: 28px;
    padding-inline: 3px;
  }
}
</style>

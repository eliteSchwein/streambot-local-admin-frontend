// Utilities
import { defineStore } from 'pinia'
import { setI18nLanguage } from '@/plugins/i18n'

export const useAppStore = defineStore('app', {
  state: () => ({
    assets: {
      assets: [],
      wleds: []
    },
    wledConfigs: {},
    status: {},
    config: {
      websocketPort: 8100,
      webserverPort: 8105
    },
    systemConfig: {
      language: 'en'
    },
    games: [],
    alerts: [],
    interactions: [],
    websocket: {
      connected: false,
      connecting: false
    },
    shieldMode: false,
    currentGame: {},
    channelPoints: {
      active: [],
      all: []
    },
    audioData: {},
    audioOutputs: {},
    audioPresets: {},
    dynamicData: {},
    systemInfo: {
      components: {},
      config: {},
    },
    throttled: false,
    scene: {},
    connections: {},
    backendConfig: '',
    parsedBackendConfig: {},
    obsSceneData: [],
    obsSceneDataByConnection: {} as Record<string, any[]>,
    testMode: false,
    voices: {},
    macros: {},
    commands: {},
    autoMacros: [],
    rotatingScenes: {},
    events: {},
    variables: {},
    giveaway: {},
    yoloboxData: {},
    obsAudioData: {},
    obsAudioDataByConnection: {} as Record<string, any>,
    musicData: {},
    musicCavaData: {},
    musicPlaylist: {
      files: [],
      playlist_length: 0,
      current_index: -1,
      window_start: 0,
      window_end: -1,
    },
    storage: {},
    integrations: {},
    settings: {},
    categoryLibrary: {
      enabled: false,
      active_category_id: null,
      categories: [],
    },
    reloadUpdate: {
      finished: true,
    },
    updateManager: {},
    restoreNotification: null as any,
    speedtest: {
      running: false,
      stage: 'idle',
      ping_ms: null,
      download_mbps: null,
      upload_mbps: null,
      error: null,
      started_at: null,
      finished_at: null,
    },
  }),
  getters: {
    getConfig: (state) => state.config,
    getSystemConfig: (state) => state.systemConfig,
    getLanguage: (state) => (state.settings as any)?.language ?? 'en',
    getWebsocket: (state) => {
      return `ws://${location.hostname}:${state.config.websocketPort}`
    },
    getRestApi: (state) => {
      return `http://${location.hostname}:${state.config.webserverPort}`
    },
    getGames: (state) => state.games,
    getAlerts: (state) => state.alerts,
    getInteractions: (state) => state.interactions,
    isWebsocketConnected: (state) => state.websocket.connected,
    isWebsocketConnecting: (state) => state.websocket.connecting,
    getCurrentGame: (state) => state.currentGame,
    isShieldActive: (state) => state.shieldMode,
    getChannelPoints: (state) => state.channelPoints,
    getAudioData: (state) => state.audioData,
    getSystemInfo: (state) => state.systemInfo,
    isThrottled: (state) => state.throttled,
    getScene: (state) => state.scene,
    getConnections: (state) => state.connections,
    getBackendConfig: (state) => state.backendConfig,
    getParsedBackendConfig: (state) => state.parsedBackendConfig,
    getObsSceneData: (state) => state.obsSceneData,
    getObsSceneDataByConnection: (state) => state.obsSceneDataByConnection,
    getObsSceneDataForConnection: (state) => (connection = 'default') => {
      const name = String(connection || 'default')
      return state.obsSceneDataByConnection[name] ?? (name === 'default' ? state.obsSceneData : [])
    },
    getTestMode: (state) => state.testMode,
    getVoices: (state) => state.voices,
    getMacros: (state) => state.macros,
    getCommands: (state) => state.commands,
    getAutoMacros: (state) => state.autoMacros,
    getRotatingScenes: (state) => state.rotatingScenes,
    getEvents: (state) => state.events,
    getVariables: (state) => state.variables,
    getGiveaway: (state) => state.giveaway,
    getYoloboxData: (state) => state.yoloboxData,
    getObsAudioData: (state) => state.obsAudioData,
    getObsAudioDataByConnection: (state) => state.obsAudioDataByConnection,
    getObsAudioDataForConnection: (state) => (connection = 'default') => {
      const name = String(connection || 'default')
      return state.obsAudioDataByConnection[name] ?? (name === 'default' ? state.obsAudioData : {})
    },
    getAssets: (state) => state.assets,
    getWledConfigs: (state) => state.wledConfigs,
    getStatus: (state) => state.status,
    getMusicData: (state) => state.musicData,
    getMusicCavaData: (state) => state.musicCavaData,
    getMusicPlaylist: (state) => state.musicPlaylist,
    getAudioOutput: (state) => state.audioOutputs,
    getAudioOutputs: (state) => state.audioOutputs,
    getAudioPresets: (state) => state.audioPresets,
    getDynamicData: (state) => state.dynamicData,
    getStorage: (state) => state.storage,
    getIntegrations: (state) => state.integrations,
    getSettings: (state) => state.settings,
    getCategoryLibrary: (state) => state.categoryLibrary,
    getReloadUpdate: (state) => state.reloadUpdate,
    getUpdateManager: (state) => state.updateManager,
    getRestoreNotification: (state) => state.restoreNotification,
    getSpeedtest: (state) => state.speedtest,

    hasObsEnabled: (state) => {
      const integrations: any = state.integrations ?? {}
      const obsIntegrations = integrations.obs

      if (obsIntegrations?.enabled === false) return false
      if (obsIntegrations?.enabled === true) return true

      if (
        obsIntegrations &&
        typeof obsIntegrations === 'object' &&
        Object.keys(obsIntegrations).length > 0
      ) {
        return true
      }

      const config: any = state.parsedBackendConfig ?? {}

      return Object.entries(config).some(([key, value]: [string, any]) => {
        if (!/^obs/i.test(key)) return false

        if (Array.isArray(value)) {
          return value.some((entry) => Boolean(entry?.ip))
        }

        if (value && typeof value === 'object') {
          return Boolean(value.ip) ||
            Object.values(value).some((entry: any) => Boolean(entry?.ip))
        }

        return false
      })
    },

    hasYoloboxEnabled: (state) => {
      return Boolean((state.integrations as any)?.yolobox?.enabled)
    },

    hasTwitchEnabled: (state) => {
      const twitch: any = (state.integrations as any)?.twitch

      if (!twitch || typeof twitch !== 'object') return false

      return twitch.control === true || twitch.message === true
    },

    hasOllamaEnabled: (state) => {
      return Boolean((state.integrations as any)?.ollama?.enabled)
    },

    hasWledEnabled: (state) => {
      const wled: any = (state.integrations as any)?.wled

      if (wled && typeof wled === 'object' && Object.keys(wled).length > 0) {
        return true
      }

      if (Object.keys(state.wledConfigs ?? {}).length > 0) {
        return true
      }

      return Array.isArray(state.assets?.wleds) && state.assets.wleds.length > 0
    },

    hasApiWebsite: (state) => {
      const parsedConfig: any = state.parsedBackendConfig ?? {}
      const rawConfig = String(state.backendConfig ?? '')

      if (parsedConfig?.api?.website) return true
      if (parsedConfig?.['api website']) return true
      if (parsedConfig?.api_website) return true
      if (parsedConfig?.website?.api) return true

      const hasRecursiveApiWebsite = (value: any): boolean => {
        if (!value || typeof value !== 'object') return false

        for (const key in value) {
          const normalizedKey = String(key).toLowerCase().replace(/[_.-]+/g, ' ').trim()

          if (normalizedKey === 'api website' && Boolean(value[key])) {
            return true
          }

          if (normalizedKey === 'api') {
            const apiValue = value[key]
            if (apiValue?.website) return true
            if (apiValue?.['website']) return true
          }

          if (hasRecursiveApiWebsite(value[key])) {
            return true
          }
        }

        return false
      }

      return hasRecursiveApiWebsite(parsedConfig) || /(^|\n)\s*\[?api\s+website\]?/i.test(rawConfig)
    },
  },
  actions: {
    async fetchConfig() {
      const request = await fetch(`/config.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2000)
      })

      if(!request.ok) {
        throw new Error(`Failed to load config.json: ${request.status}`)
      }

      const config = await request.json()

      this.$patch(state => state.config = {
        ...config,
        websocketPort: config?.websocket?.port ?? 8100,
        webserverPort: config?.webserver?.port ?? 8105,
      })

      if(typeof config?.language === 'string') {
        setI18nLanguage(config.language)
      }
    },
    async fetchGames() {
      const request = await fetch(`${this.getRestApi}/api/games/all`, { cache: "no-store" })
      const data = (await request.json()).data

      this.games = data

      this.$patch(state => state.games = data)
    },
    setAlerts(alerts: []) {
      this.alerts = alerts
      this.$patch(state => state.alerts = alerts)
    },
    setInteractions(interactions: any[]) {
      const normalized = Array.isArray(interactions) ? interactions : []
      this.interactions = normalized
      this.$patch(state => state.interactions = normalized)
    },
    upsertInteraction(interaction: any) {
      if (!interaction?.uuid) return

      const index = this.interactions.findIndex((item: any) => item?.uuid === interaction.uuid)
      if (index >= 0) {
        this.interactions[index] = {
          ...this.interactions[index],
          ...interaction,
        }
      } else {
        this.interactions.push(interaction)
      }

      this.$patch(state => state.interactions = [...this.interactions])
    },
    removeInteraction(uuid: string) {
      this.interactions = this.interactions.filter((item: any) => item?.uuid !== uuid)
      this.$patch(state => state.interactions = [...this.interactions])
    },
    setWebsocketConnected(connected: boolean) {
      this.websocket.connected = connected
      this.$patch(state => state.websocket.connected = connected)
    },
    setWebsocketConnecting(connecting: boolean) {
      this.websocket.connecting = connecting
      this.$patch(state => state.websocket.connecting = connecting)
    },
    setCurrentGame(currentGame: any) {
      this.currentGame = currentGame
      this.$patch(state => state.currentGame = currentGame)
    },
    setShieldActive(shieldMode: boolean) {
      this.shieldMode = shieldMode
      this.$patch(state => state.shieldMode = shieldMode)
    },
    setChannelPoints(channelPoints: []) {
      this.channelPoints = channelPoints
      this.$patch(state => state.channelPoints = channelPoints)
    },
    setAudioData(audioData: {}) {
      this.audioData = audioData
      this.$patch(state => state.audioData = audioData)
    },
    setThrottled(throttled: boolean) {
      this.throttled = throttled
      this.$patch(state => state.throttled = throttled)
    },
    setSystemInfo(systemInfo: any) {
      this.systemInfo = systemInfo
      this.$patch(state => state.systemInfo = systemInfo)
    },
    setScene(scene: {}) {
      this.scene = scene
      this.$patch(state => state.scene = scene)
    },
    setConnections(connections: {}) {
      this.connections = connections
      this.$patch(state => state.connections = connections)
    },
    setBackendConfig(config: string, parsedConfig: any) {
      this.backendConfig = config
      this.parsedBackendConfig = parsedConfig

      this.$patch(state => state.backendConfig = config)
      this.$patch(state => state.parsedBackendConfig = parsedConfig)

      if (parsedConfig?.system_config) {
        this.setSystemConfig(parsedConfig.system_config)
      }
    },
    setSystemConfig(systemConfig: any) {
      const mergedSystemConfig = {
        ...this.systemConfig,
        ...systemConfig
      }

      this.systemConfig = mergedSystemConfig
      this.$patch(state => state.systemConfig = mergedSystemConfig)
    },
    setSystemLanguage(language: string) {
      const normalizedLanguage = setI18nLanguage(language)

      this.settings = {
        ...this.settings,
        language: normalizedLanguage
      }

      this.$patch(state => state.settings = this.settings)
    },
    setObsSceneData(obsSceneData: any) {
      const nextByConnection: Record<string, any[]> = {}

      const add = (connection: any, value: any) => {
        const name = String(connection ?? 'default').trim() || 'default'
        const entries = Array.isArray(value) ? value : (value == null ? [] : [value])
        nextByConnection[name] = [...(nextByConnection[name] ?? []), ...entries]
      }

      if (Array.isArray(obsSceneData)) {
        const hasConnectionMetadata = obsSceneData.some((entry: any) =>
          entry && typeof entry === 'object' && (entry.obs_id ?? entry.obsId ?? entry.connection)
        )

        if (hasConnectionMetadata) {
          for (const entry of obsSceneData) {
            const connection = entry?.obs_id ?? entry?.obsId ?? entry?.connection ?? 'default'
            // Keep the canvas/root object intact. It may carry canvas metadata in addition to scenes.
            const value = entry?.data ?? entry
            add(connection, value)
          }
        } else {
          add('default', obsSceneData)
        }
      } else if (obsSceneData && typeof obsSceneData === 'object') {
        const connection = obsSceneData.obs_id ?? obsSceneData.obsId ?? obsSceneData.connection
        const wrappedData = obsSceneData.data

        if (connection !== undefined) {
          Object.assign(nextByConnection, this.obsSceneDataByConnection ?? {})
          // Keep scene/canvas metadata intact unless the backend explicitly wraps it in `data`.
          add(connection, wrappedData ?? obsSceneData)
        } else if (obsSceneData.connections && typeof obsSceneData.connections === 'object') {
          for (const [name, value] of Object.entries(obsSceneData.connections)) add(name, value)
        } else {
          const entries = Object.entries(obsSceneData)
          const looksLikeConnectionMap = entries.length > 0 && entries.every(([, value]) => Array.isArray(value))

          if (looksLikeConnectionMap) {
            for (const [name, value] of entries) add(name, value)
          } else {
            add('default', obsSceneData)
          }
        }
      } else {
        add('default', [])
      }

      this.obsSceneDataByConnection = nextByConnection
      this.obsSceneData = Object.values(nextByConnection).flat()

      this.$patch(state => {
        state.obsSceneDataByConnection = nextByConnection
        state.obsSceneData = this.obsSceneData
      })
    },
    setTestMode(testMode: boolean) {
      this.testMode = testMode
      this.$patch(state => state.testMode = testMode)
    },
    setVoices(voices: Record<string, string[]>) {
      this.voices = voices
      this.$patch(state => state.voices = voices)
    },
    setMacros(macros: {}) {
      this.macros = macros
      this.$patch(state => state.macros = macros)
    },
    setCommands(commands: {}) {
      this.commands = commands
      this.$patch(state => state.commands = commands)
    },
    setAutoMacros(autoMacros: []) {
      this.autoMacros = autoMacros
      this.$patch(state => state.autoMacros = autoMacros)
    },
    setRotatingScenes(rotatingScenes: {}) {
      this.rotatingScenes = rotatingScenes ?? {}
      this.$patch(state => state.rotatingScenes = this.rotatingScenes)
    },
    setEvents(events: {}) {
      this.events = events ?? {}
      this.$patch(state => state.events = this.events)
    },
    setVariables(variables: {}) {
      this.variables = variables
      this.$patch(state => state.variables = variables)
    },
    setGiveaway(giveaway: {}) {
      this.giveaway = giveaway
      this.$patch(state => state.giveaway = giveaway)
    },
    setYoloboxData(yoloboxData: {}) {
      this.yoloboxData = yoloboxData
      this.$patch(state => state.yoloboxData = yoloboxData)
    },
    setObsAudioData(obsAudioData: any) {
      const nextByConnection: Record<string, any> = {}

      const add = (connection: any, value: any) => {
        const name = String(connection ?? 'default').trim() || 'default'
        nextByConnection[name] = value ?? {}
      }

      if (Array.isArray(obsAudioData)) {
        const grouped: Record<string, any[]> = {}
        for (const entry of obsAudioData) {
          const name = String(entry?.obs_id ?? entry?.obsId ?? entry?.connection ?? 'default').trim() || 'default'
          const value = entry?.audio ?? entry?.inputs ?? entry?.data ?? entry
          grouped[name] = [...(grouped[name] ?? []), value]
        }
        for (const [name, value] of Object.entries(grouped)) add(name, value)
      } else if (obsAudioData && typeof obsAudioData === 'object') {
        const connection = obsAudioData.obs_id ?? obsAudioData.obsId ?? obsAudioData.connection
        const wrappedData = obsAudioData.audio ?? obsAudioData.inputs ?? obsAudioData.data

        if (connection !== undefined && wrappedData !== undefined) {
          Object.assign(nextByConnection, this.obsAudioDataByConnection ?? {})
          add(connection, wrappedData)
        } else if (obsAudioData.connections && typeof obsAudioData.connections === 'object') {
          for (const [name, value] of Object.entries(obsAudioData.connections)) add(name, value)
        } else {
          const entries = Object.entries(obsAudioData)
          const indexedSceneConnections = new Set(Object.keys(this.obsSceneDataByConnection ?? {}))
          const looksLikeConnectionMap = entries.length > 0
            && entries.every(([name, value]) =>
              indexedSceneConnections.has(name)
              && value !== null
              && typeof value === 'object'
            )

          if (looksLikeConnectionMap) {
            for (const [name, value] of entries) add(name, value)
          } else {
            // Legacy payload: a single map of OBS inputs.
            add('default', obsAudioData)
          }
        }
      } else {
        add('default', {})
      }

      this.obsAudioDataByConnection = nextByConnection

      // Keep the legacy getter useful for old editors by exposing all indexed inputs.
      const merged: Record<string, any> = {}
      for (const [connection, value] of Object.entries(nextByConnection)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(merged, value)
        } else {
          merged[connection] = value
        }
      }
      this.obsAudioData = merged

      this.$patch(state => {
        state.obsAudioDataByConnection = nextByConnection
        state.obsAudioData = this.obsAudioData
      })
    },
    setAssets(assets: any) {
      this.assets = assets
      this.$patch(state => state.assets = assets)
    },
    setWledConfigs(wledConfigs: any) {
      this.wledConfigs = wledConfigs
      this.$patch(state => state.wledConfigs = wledConfigs)
    },
    setStatus(status: any) {
      this.status = status
      this.$patch(state => state.status = status)
    },
    setMusicData(musicData: any) {
      this.musicData = musicData
      this.$patch(state => state.musicData = musicData)
    },
    setMusicCavaData(musicCavaData: any) {
      if (this.musicCavaData?.raw === musicCavaData?.raw) return
      this.musicCavaData = musicCavaData
    },
    setMusicPlaylist(musicPlaylist: any) {
      this.musicPlaylist = musicPlaylist ?? {
        files: [],
        playlist_length: 0,
        current_index: -1,
        window_start: 0,
        window_end: -1,
      }
      this.$patch(state => state.musicPlaylist = this.musicPlaylist)
    },
    setAudioOutput(audioOutputs: any) {
      this.audioOutputs = audioOutputs
      this.$patch(state => state.audioOutputs = audioOutputs)
    },
    setAudioOutputs(audioOutputs: any) {
      this.audioOutputs = audioOutputs
      this.$patch(state => state.audioOutputs = audioOutputs)
    },
    setAudioPresets(audioPresets: any) {
      this.audioPresets = audioPresets ?? {}
      this.$patch(state => state.audioPresets = this.audioPresets)
    },
    setDynamicData(dynamicData: any) {
      this.dynamicData = dynamicData ?? {}
      this.$patch(state => state.dynamicData = this.dynamicData)
    },
    setStorage(storage: any) {
      this.storage = storage
      this.$patch(state => state.storage = storage)
    },
    setIntegrations(integrations: any) {
      this.integrations = integrations
      this.$patch(state => state.integrations = integrations)
    },
    setSettings(settings: any) {
      const nextSettings = settings ?? {}

      this.settings = nextSettings
      this.$patch(state => state.settings = nextSettings)

      const categoryLibraryEnabled = nextSettings?.category_library?.enabled
      if (typeof categoryLibraryEnabled === 'boolean') {
        this.categoryLibrary = {
          ...this.categoryLibrary,
          enabled: categoryLibraryEnabled,
        }
        this.$patch(state => state.categoryLibrary = this.categoryLibrary)
      }

      if(typeof nextSettings.language === 'string') {
        setI18nLanguage(nextSettings.language)
      }
    },

    setCategoryLibrary(categoryLibrary: any) {
      const snapshotEnabled = categoryLibrary?.enabled
      const nestedEnabled = categoryLibrary?.settings?.enabled
      const settingsEnabled = this.settings?.category_library?.enabled

      const enabled =
        typeof snapshotEnabled === 'boolean'
          ? snapshotEnabled
          : typeof nestedEnabled === 'boolean'
            ? nestedEnabled
            : typeof settingsEnabled === 'boolean'
              ? settingsEnabled
              : false

      this.categoryLibrary = {
        ...categoryLibrary,
        enabled,
        active_category_id: categoryLibrary?.active_category_id ?? null,
        categories: Array.isArray(categoryLibrary?.categories) ? categoryLibrary.categories : [],
      }
      this.$patch(state => state.categoryLibrary = this.categoryLibrary)
    },

    setUpdateManager(updateManager: any) {
      this.updateManager = updateManager ?? {}
      this.$patch(state => state.updateManager = this.updateManager)
    },

    setRestoreNotification(payload: any) {
      this.restoreNotification = payload ?? null
      this.$patch(state => state.restoreNotification = this.restoreNotification)
    },

    clearRestoreNotification() {
      this.restoreNotification = null
      this.$patch(state => state.restoreNotification = null)
    },

    setReloadUpdate(reloadUpdate: any) {
      this.reloadUpdate = {
        finished: reloadUpdate?.finished === true,
      }
      this.$patch(state => state.reloadUpdate = this.reloadUpdate)
    },

    setSpeedtest(speedtest: any) {
      this.speedtest = {
        running: speedtest?.running === true,
        stage: speedtest?.stage ?? 'idle',
        ping_ms: speedtest?.ping_ms ?? null,
        download_mbps: speedtest?.download_mbps ?? null,
        upload_mbps: speedtest?.upload_mbps ?? null,
        error: speedtest?.error ?? null,
        started_at: speedtest?.started_at ?? null,
        finished_at: speedtest?.finished_at ?? null,
      }

      this.$patch(state => state.speedtest = this.speedtest)
    },
    async fetchStatus(): Promise<any> {
      let status: any = null

      try {
        const response = await fetch(`${this.getRestApi}/api/status`, {
          cache: "no-store",
          signal: AbortSignal.timeout(2000)
        })

        if(!response.ok) {
          throw new Error(`Failed to fetch backend status: ${response.status}`)
        }

        status = (await response.json()).data
      } catch (error) {
        console.warn(error)
      }

      this.setStatus(status)
      return status
    }
  }
})

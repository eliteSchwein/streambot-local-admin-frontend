<template>
  <v-app>
    <v-card color="transparent" rounded="0">
      <v-layout style="min-height: 100vh; max-height: 100vh; position: relative">
        <Navigation />
        <router-view />
      </v-layout>
    </v-card>

    <ConnectDialog
      :backend-ready="ready === true"
      :startup-stage="stage"
    />
    <PowerDialog/>
  </v-app>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import WebsocketClient from "@/plugins/webSocketClient"
import { sleep } from "@/helper/GeneralHelper.ts"
import { getWebsocketClient, setWebsocketClient } from "@/plugins/websocketInstance"

const appOption = useAppStore()

const ready = ref(false)
const stage = ref<string | undefined>(undefined)

let configLoaded = false
let gamesLoaded = false
let reconnectLoopRunning = false
let stopped = false

if(window.location.hostname === 'localhost') {
  ready.value = true
}

async function tryFetchConfig() {
  if(configLoaded) {
    return true
  }

  try {
    await appOption.fetchConfig()
    configLoaded = true
    return true
  } catch {
    return false
  }
}

async function tryFetchGames() {
  if(gamesLoaded || !configLoaded) {
    return
  }

  try {
    await appOption.fetchGames()
    gamesLoaded = true
  } catch {
    // Games are not required for reconnecting. Retry on the next loop.
  }
}

async function reconnectLoop() {
  if(reconnectLoopRunning) {
    return
  }

  reconnectLoopRunning = true

  try {
    while(!stopped) {
      if(appOption.isWebsocketConnected) {
        await sleep(2000)
        continue
      }

      const status = await appOption.fetchStatus()
      const hasStatus = Boolean(
        status &&
        typeof status === 'object'
      )

      // Keep the last successful startup state during transient status
      // request failures. A single timeout must not briefly erase the
      // current boot stage and make the connect dialog flicker.
      if(!hasStatus) {
        await sleep(500)
        continue
      }

      const backendReady = status.ready === true

      ready.value = backendReady

      if(typeof status.bootup_stage === 'string' && status.bootup_stage.length > 0) {
        stage.value = status.bootup_stage
      }

      // As soon as the backend answers /api/status at least once,
      // config.json should also be retried. This lets the admin panel
      // pick up language and connection settings during backend startup.
      await tryFetchConfig()

      if(!backendReady) {
        await sleep(500)
        continue
      }

      if(!configLoaded) {
        await sleep(500)
        continue
      }

      if(!getWebsocketClient()) {
        setWebsocketClient(new WebsocketClient(appOption.getWebsocket, appOption))
      }

      if(
        !appOption.isWebsocketConnected &&
        !appOption.isWebsocketConnecting
      ) {
        try {
          await getWebsocketClient()?.connect()
        } catch {
          // Keep polling status and retrying automatically.
        }
      }

      await tryFetchGames()
      await sleep(appOption.isWebsocketConnected ? 2000 : 500)
    }
  } finally {
    reconnectLoopRunning = false
  }
}

onMounted(() => {
  void reconnectLoop()
})

onBeforeUnmount(() => {
  stopped = true
})
</script>

<style>
html {
  overflow: hidden;
}

/* Keep all Vuetify dialog toolbars visually identical. */
.v-dialog .v-toolbar {
  height: 56px !important;
  min-height: 56px !important;
  max-height: 56px !important;
}

.v-dialog .v-toolbar__content {
  height: 56px !important;
  min-height: 56px !important;
  max-height: 56px !important;
  align-items: center !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.v-dialog .v-toolbar-title {
  height: 56px !important;
  min-height: 56px !important;
  display: flex !important;
  align-items: center !important;
  min-width: 0;
}

.v-dialog .v-toolbar-title__placeholder {
  width: 100%;
  height: 56px !important;
  min-height: 56px !important;
  display: flex !important;
  align-items: center !important;
  min-width: 0;
  line-height: 1.2 !important;
}

/* Font metrics make toolbar text look slightly high even when its box is centered. */
.v-dialog .v-toolbar-title__placeholder > span {
  display: inline-flex;
  align-items: center;
  transform: translateY(1px);
}
</style>

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
      const status = await appOption.fetchStatus()
      const hasStatus = Boolean(
        status &&
        typeof status === 'object'
      )
      const backendReady = hasStatus && status.ready === true

      ready.value = backendReady
      stage.value = hasStatus && typeof status.bootup_stage === 'string'
        ? status.bootup_stage
        : undefined

      if(!backendReady) {
        await sleep(500)
        continue
      }

      const hasConfig = await tryFetchConfig()

      if(!hasConfig) {
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
</style>

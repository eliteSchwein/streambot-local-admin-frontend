<script lang="ts" setup>
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useI18n } from "vue-i18n"
import { useAppStore } from "@/stores/app"

const props = defineProps<{
  backendReady: boolean
  startupStage?: string
}>()

const appStore = useAppStore()
const { isWebsocketConnecting, isWebsocketConnected } = storeToRefs(appStore)
const { t, te } = useI18n()

const dialogVisible = computed(() => {
  return !props.backendReady || !isWebsocketConnected.value
})

const showStartupStatus = computed(() => {
  return !props.backendReady && Boolean(props.startupStage)
})

const localizedStage = computed(() => {
  const stage = props.startupStage || "unknown"
  const key = `connectDialog.startup.stages.${stage}`

  return te(key)
    ? t(key)
    : t("connectDialog.startup.stages.unknown")
})
</script>

<template>
  <v-dialog
    width="500"
    :model-value="dialogVisible"
    persistent
  >
    <v-card v-if="dialogVisible" :loading="backendReady && isWebsocketConnecting">
      <template v-if="showStartupStatus">
        <v-toolbar
          flat
          density="compact"
          color="warning"
        >
          <v-toolbar-title class="d-flex align-center">
            {{ $t('connectDialog.startup.title') }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <div class="mb-4">
            {{ $t('connectDialog.startup.text') }}
          </div>

          <div class="text-h6">
            <v-progress-circular indeterminate class="mr-1" :size="20"></v-progress-circular> {{ localizedStage }}
          </div>
        </v-card-text>
      </template>

      <template v-else>
        <v-toolbar
          flat
          density="compact"
          color="warning"
        >
          <v-toolbar-title class="d-flex align-center">
            {{
              isWebsocketConnecting
                ? $t('connectDialog.reconnecting')
                : $t('connectDialog.connectionLost')
            }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          {{ $t('connectDialog.connectionLostText') }}
        </v-card-text>
      </template>
    </v-card>
  </v-dialog>
</template>

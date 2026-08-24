<template>
  <v-card
    color="grey-darken-3"
    variant="flat"
    class="speedtest-card h-100"
  >
    <v-card-text class="pa-3">
      <div class="text-subtitle-2 mb-3 d-flex align-center justify-space-between ga-2">
        <span>{{ $t('system.speedtest.title') }}</span>

        <v-chip
          v-if="speedtest.running"
          size="x-small"
          color="primary"
          variant="tonal"
        >
          {{ stageLabel }}
        </v-chip>
      </div>

      <div class="speedtest-card__metrics">
        <div class="speedtest-card__metric">
          <div class="text-caption text-medium-emphasis">
            {{ $t('system.speedtest.ping') }}
          </div>
          <div class="text-h6 font-weight-medium">
            {{ formatPing(speedtest.ping_ms) }}
          </div>
        </div>

        <div class="speedtest-card__metric">
          <div class="text-caption text-medium-emphasis">
            {{ $t('system.speedtest.download') }}
          </div>
          <div class="text-h6 font-weight-medium">
            {{ formatBandwidth(speedtest.download_mbps) }}
          </div>
        </div>

        <div class="speedtest-card__metric">
          <div class="text-caption text-medium-emphasis">
            {{ $t('system.speedtest.upload') }}
          </div>
          <div class="text-h6 font-weight-medium">
            {{ formatBandwidth(speedtest.upload_mbps) }}
          </div>
        </div>
      </div>

      <v-alert
        v-if="speedtest.error"
        type="error"
        density="compact"
        variant="tonal"
        class="mt-3"
      >
        {{ speedtest.error }}
      </v-alert>

      <v-btn
        block
        color="primary"
        variant="tonal"
        class="mt-3"
        :loading="speedtestBusy"
        :disabled="speedtestBusy || !websocketConnected"
        @click="runSpeedtest"
      >
        {{ $t('system.speedtest.run') }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

type SpeedtestState = {
  running?: boolean
  stage?: string
  ping_ms?: number | null
  download_mbps?: number | null
  upload_mbps?: number | null
  error?: string | null
  started_at?: string | null
  finished_at?: string | null
}

export default {
  name: 'SpeedtestCard',

  data() {
    return {
      starting: false,
      startGuardTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
    }
  },

  computed: {
    appStore() {
      return useAppStore()
    },

    speedtest(): SpeedtestState {
      return this.appStore.getSpeedtest ?? {}
    },

    websocketConnected(): boolean {
      return this.appStore.isWebsocketConnected === true
    },

    speedtestBusy(): boolean {
      return this.starting || this.speedtest.running === true
    },

    stageLabel(): string {
      const stage = String(this.speedtest.stage ?? 'idle')
      const key = `system.speedtest.stages.${stage}`

      return this.$te(key)
        ? String(this.$t(key))
        : stage
    },
  },

  watch: {
    'speedtest.running'() {
      this.starting = false

      if (this.startGuardTimeout) {
        clearTimeout(this.startGuardTimeout)
        this.startGuardTimeout = undefined
      }
    },
  },

  beforeUnmount() {
    if (this.startGuardTimeout) {
      clearTimeout(this.startGuardTimeout)
    }
  },

  methods: {
    runSpeedtest() {
      if (this.speedtestBusy || !this.websocketConnected) return

      this.starting = true

      void getWebsocketClient()?.send('speedtest', {
        action: 'start',
      })

      this.startGuardTimeout = setTimeout(() => {
        if (!this.speedtest.running) {
          this.starting = false
        }

        this.startGuardTimeout = undefined
      }, 3000)
    },

    formatPing(value: number | null | undefined): string {
      return Number.isFinite(value)
        ? `${Number(value).toFixed(0)} ms`
        : '—'
    },

    formatBandwidth(value: number | null | undefined): string {
      return Number.isFinite(value)
        ? `${Number(value).toFixed(1)} Mbps`
        : '—'
    },
  },
}
</script>

<style scoped>
.speedtest-card {
  min-height: 116px;
}

.speedtest-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.speedtest-card__metric {
  min-width: 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 600px) {
  .speedtest-card__metrics {
    grid-template-columns: 1fr;
  }
}
</style>

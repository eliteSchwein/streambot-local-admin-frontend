<script lang="ts">
import eventBus from "@/eventBus";
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { getWebsocketClient } from "@/plugins/websocketInstance";

export default {
  data () {
    return {
      show: false,
      activeAction: null as null | 'backend' | 'browsers' | 'reboot' | 'shutdown',
    }
  },

  computed: {
    ...mapState(useAppStore, ['getRestApi', 'getObsAudioData']),
    busy(): boolean {
      return this.activeAction !== null
    },
    powerActionColumnSize(): number {
      return Object.keys(this.getObsAudioData ?? {}).length > 0 ? 6 : 4
    },
  },

  mounted(): any {
    eventBus.$on('dialog:show', (target: string) => {
      if (target === 'power') {
        this.activeAction = null
        this.show = true
      }
    })
  },

  methods: {
    closeDialog() {
      if (this.busy) return
      this.show = false
    },

    sendPowerCommand(target: 'reboot' | 'halt') {
      getWebsocketClient()?.send('halt_system', { target })
    },

    async restartBackend() {
      if (this.busy) return
      this.activeAction = 'backend'

      try {
        await fetch(`${this.getRestApi}/api/system/restart`)
        this.show = false
      } catch (error) {
        console.error('backend restart failed', error)
        this.activeAction = null
      }
    },

    async reloadBrowserSources() {
      if (this.busy) return
      this.activeAction = 'browsers'

      try {
        const response = await fetch(`${this.getRestApi}/api/obs/reload_browsers`)
        if (!response.ok) throw new Error(`reload failed (${response.status})`)
        this.activeAction = null
      } catch (error) {
        console.error('browser source reload failed', error)
        this.activeAction = null
      }
    },

    rebootSystem() {
      if (this.busy) return
      this.activeAction = 'reboot'
      this.sendPowerCommand('reboot')
      this.show = false
    },

    shutdownSystem() {
      if (this.busy) return
      this.activeAction = 'shutdown'
      this.sendPowerCommand('halt')
      this.show = false
    },
  }
}
</script>

<template>
  <v-dialog
    v-model="show"
    width="820"
    max-width="calc(100vw - 16px)"
    scrollable
  >
    <v-card>
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-power" class="mr-2" />
          <span class="text-truncate">{{ $t('power.dialog.title') }}</span>
        </v-toolbar-title>

        <v-btn
          icon
          variant="text"
          :disabled="busy"
          :title="$t('common.close')"
          @click="closeDialog"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-card-text class="px-3 py-3">
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('power.dialog.subtitle') }}
        </div>

        <v-row dense>
          <v-col cols="12" :md="powerActionColumnSize">
            <v-card variant="outlined" class="power-action-card h-100">
              <v-card-text class="d-flex flex-column h-100 pa-3">
                <div class="d-flex align-center ga-3 mb-3">
                  <v-icon icon="mdi-robot-outline" color="primary" size="28" />
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ $t('power.dialog.restartBackend') }}
                  </div>
                </div>

                <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-4">
                  {{ $t('power.dialog.restartBackendDescription') }}
                </div>

                <v-btn
                  block
                  class="power-action-button"
                  color="primary"
                  variant="tonal"
                  :loading="activeAction === 'backend'"
                  :disabled="busy && activeAction !== 'backend'"
                  @click="restartBackend"
                >
                  <v-icon icon="mdi-restart" class="mr-2" />
                  {{ $t('power.dialog.restartBackend') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col v-if="Object.keys(getObsAudioData ?? {}).length > 0" cols="12" :md="powerActionColumnSize">
            <v-card variant="outlined" class="power-action-card h-100">
              <v-card-text class="d-flex flex-column h-100 pa-3">
                <div class="d-flex align-center ga-3 mb-3">
                  <v-icon icon="mdi-application-outline" color="info" size="28" />
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ $t('power.dialog.reloadBrowserSources') }}
                  </div>
                </div>

                <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-4">
                  {{ $t('power.dialog.reloadBrowserSourcesDescription') }}
                </div>

                <v-btn
                  block
                  class="power-action-button"
                  color="info"
                  variant="tonal"
                  :loading="activeAction === 'browsers'"
                  :disabled="busy && activeAction !== 'browsers'"
                  @click="reloadBrowserSources"
                >
                  <v-icon icon="mdi-refresh" class="mr-2" />
                  {{ $t('power.dialog.reloadBrowserSources') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" :md="powerActionColumnSize">
            <v-card variant="outlined" class="power-action-card h-100">
              <v-card-text class="d-flex flex-column h-100 pa-3">
                <div class="d-flex align-center ga-3 mb-3">
                  <v-icon icon="mdi-restart" color="warning" size="28" />
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ $t('power.dialog.reboot') }}
                  </div>
                </div>

                <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-4">
                  {{ $t('power.dialog.rebootDescription') }}
                </div>

                <v-btn
                  block
                  class="power-action-button"
                  color="warning"
                  variant="tonal"
                  :disabled="busy"
                  @click="rebootSystem"
                >
                  <v-icon icon="mdi-restart" class="mr-2" />
                  {{ $t('power.dialog.reboot') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" :md="powerActionColumnSize">
            <v-card variant="outlined" class="power-action-card h-100">
              <v-card-text class="d-flex flex-column h-100 pa-3">
                <div class="d-flex align-center ga-3 mb-3">
                  <v-icon icon="mdi-power" color="error" size="28" />
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ $t('power.dialog.shutdown') }}
                  </div>
                </div>

                <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-4">
                  {{ $t('power.dialog.shutdownDescription') }}
                </div>

                <v-btn
                  block
                  class="power-action-button"
                  color="error"
                  variant="tonal"
                  :disabled="busy"
                  @click="shutdownSystem"
                >
                  <v-icon icon="mdi-power" class="mr-2" />
                  {{ $t('power.dialog.shutdown') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="busy"
          @click="closeDialog"
        >
          <v-icon icon="mdi-close" class="mr-2" />
          {{ $t('common.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.power-action-card {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}

.power-action-button {
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  padding-inline: 12px !important;
}

.power-action-button :deep(.v-btn__content) {
  height: 42px;
  white-space: nowrap;
}

.min-width-0 {
  min-width: 0;
}
</style>

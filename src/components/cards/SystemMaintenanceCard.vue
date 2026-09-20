<template>
  <v-card
    color="grey-darken-3"
    variant="flat"
    class="system-maintenance-card h-100"
  >
    <v-card-text class="pa-3">
      <div class="text-subtitle-2 mb-3 d-flex align-center ga-2">
        <v-icon icon="mdi-tools" size="small" />
        <span>{{ $t('system.maintenance.title') }}</span>
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-3"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <div class="system-maintenance-card__actions">
        <v-card
          color="rgba(255,255,255,0.035)"
          variant="flat"
          class="system-maintenance-card__action"
        >
          <v-card-text class="pa-3 d-flex flex-column h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon icon="mdi-archive-arrow-down" />
              <span class="font-weight-medium">{{ $t('system.maintenance.backup.title') }}</span>
            </div>
            <div class="text-caption text-medium-emphasis mb-3 flex-grow-1">
              {{ $t('system.maintenance.backup.description') }}
            </div>
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="mdi-download"
              :loading="workingAction === 'backup'"
              :disabled="busy"
              @click="downloadBackup"
            >
              {{ $t('system.maintenance.backup.action') }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card
          color="rgba(255,255,255,0.035)"
          variant="flat"
          class="system-maintenance-card__action"
        >
          <v-card-text class="pa-3 d-flex flex-column h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon icon="mdi-backup-restore" />
              <span class="font-weight-medium">{{ $t('system.maintenance.restore.title') }}</span>
            </div>
            <div class="text-caption text-medium-emphasis mb-3 flex-grow-1">
              {{ $t('system.maintenance.restore.description') }}
            </div>
            <input
              ref="restoreInput"
              type="file"
              accept=".tar.zst,.tzst,.tar,.tar.gz,.tgz,.tar.xz,.txz,.tar.bz2,.tbz2,.tbz,.zip,application/zstd,application/x-zstd,application/x-tar,application/gzip,application/x-xz,application/x-bzip2,application/zip"
              class="d-none"
              @change="restoreFileSelected"
            >
            <v-btn
              block
              color="warning"
              variant="tonal"
              prepend-icon="mdi-upload"
              :loading="workingAction === 'restore-upload'"
              :disabled="busy"
              @click="selectRestoreFile"
            >
              {{ $t('system.maintenance.restore.action') }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card
          color="rgba(255,255,255,0.035)"
          variant="flat"
          class="system-maintenance-card__action"
        >
          <v-card-text class="pa-3 d-flex flex-column h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon icon="mdi-file-document-outline" />
              <span class="font-weight-medium">{{ $t('system.maintenance.log.title') }}</span>
            </div>
            <div class="text-caption text-medium-emphasis mb-3 flex-grow-1">
              {{ $t('system.maintenance.log.description') }}
            </div>
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="mdi-download"
              :loading="workingAction === 'log'"
              :disabled="busy"
              @click="downloadLog"
            >
              {{ $t('system.maintenance.log.action') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>

  <RestoreBackupDialog
    v-model="restoreDialog"
    :payload="restorePayload"
    :loading="workingAction === 'restore-apply'"
    :error="restoreError"
    @restore="applyRestore"
  />
</template>

<script lang="ts">
import RestoreBackupDialog from '@/components/dialogs/RestoreBackupDialog.vue'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

export default {
  name: 'SystemMaintenanceCard',

  components: {
    RestoreBackupDialog,
  },

  data() {
    return {
      workingAction: '' as '' | 'backup' | 'restore-upload' | 'restore-apply' | 'log',
      errorMessage: '',
      restoreError: '',
    }
  },

  computed: {
    appStore() {
      return useAppStore()
    },

    restApi(): string {
      return this.appStore.getRestApi
    },

    busy(): boolean {
      return Boolean(this.workingAction)
    },

    restorePayload(): Record<string, any> {
      return (this.appStore.getRestoreNotification ?? {}) as Record<string, any>
    },

    restoreDialog: {
      get(): boolean {
        return Boolean(this.appStore.getRestoreNotification)
      },
      set(open: boolean) {
        if (!open) this.appStore.clearRestoreNotification()
      },
    },
  },

  watch: {
    restorePayload: {
      deep: false,
      handler(payload: any) {
        if (!payload) return
        this.restoreError = ''
        if (this.workingAction === 'restore-upload') this.workingAction = ''
      },
    },
  },

  methods: {
    selectRestoreFile() {
      if (this.busy) return
      const input = this.$refs.restoreInput as HTMLInputElement | undefined
      if (!input) return
      input.value = ''
      input.click()
    },

    async restoreFileSelected(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file || this.busy) return

      this.workingAction = 'restore-upload'
      this.errorMessage = ''
      this.restoreError = ''

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.restApi}/api/system/restore`, {
          method: 'POST',
          body: formData,
        })

        const contentType = response.headers.get('content-type') ?? ''
        const body = contentType.includes('application/json')
          ? await response.json().catch(() => ({}))
          : {}
        const data = body?.data ?? body

        if (!response.ok || data?.error || body?.error) {
          throw new Error(data?.message ?? data?.error ?? body?.error ?? `restore upload failed (${response.status})`)
        }

        const hasInlineRestoreOptions = [
          'options',
          'restore_options',
          'available',
          'items',
          'categories',
          'manifest',
          'tree',
          'files_tree',
          'file_tree',
        ].some((key) => data?.[key] != null)

        if (hasInlineRestoreOptions) {
          this.appStore.setRestoreNotification(data)
        }
      } catch (error: any) {
        this.errorMessage = error?.message ?? String(error)
      } finally {
        if (this.workingAction === 'restore-upload') {
          this.workingAction = ''
        }
        input.value = ''
      }
    },

    async applyRestore(payload: any) {
      if (this.busy) return

      this.workingAction = 'restore-apply'
      this.restoreError = ''

      try {
        const method = String(
          this.restorePayload?.confirm_method
          ?? this.restorePayload?.restore_method
          ?? this.restorePayload?.method
          ?? 'restore'
        )

        const response = await getWebsocketClient()?.request(method, payload, 120_000)
        const data = response?.params ?? response?.data ?? response

        if (data?.error) {
          throw new Error(data.error)
        }

        this.appStore.clearRestoreNotification()
      } catch (error: any) {
        this.restoreError = error?.message ?? String(error)
      } finally {
        this.workingAction = ''
      }
    },

    async downloadBackup() {
      if (this.busy) return
      this.workingAction = 'backup'
      this.errorMessage = ''

      try {
        await this.downloadFile(
          `${this.restApi}/api/system/backup`,
          `streambot-backup-${this.timestamp()}.tar.zst`
        )
      } catch (error: any) {
        this.errorMessage = error?.message ?? String(error)
      } finally {
        this.workingAction = ''
      }
    },

    async downloadLog() {
      if (this.busy) return
      this.workingAction = 'log'
      this.errorMessage = ''

      try {
        await this.downloadFile(
          `${this.restApi}/api/system/log`,
          `streambot-${this.timestamp()}.log`
        )
      } catch (error: any) {
        this.errorMessage = error?.message ?? String(error)
      } finally {
        this.workingAction = ''
      }
    },

    async downloadFile(url: string, fallbackName: string) {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.data?.message ?? body?.data?.error ?? body?.error ?? `download failed (${response.status})`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = this.fileNameFromDisposition(response.headers.get('content-disposition')) || fallbackName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    },

    fileNameFromDisposition(value: string | null): string {
      if (!value) return ''
      const encoded = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
      if (encoded) {
        try {
          return decodeURIComponent(encoded.replace(/["']/g, ''))
        } catch {
          return encoded.replace(/["']/g, '')
        }
      }

      return value.match(/filename="?([^";]+)"?/i)?.[1]?.trim() ?? ''
    },

    timestamp(): string {
      return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
    },
  },
}
</script>

<style scoped>
.system-maintenance-card {
  min-height: 116px;
}

.system-maintenance-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.system-maintenance-card__action {
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 1100px) {
  .system-maintenance-card__actions {
    grid-template-columns: 1fr;
  }
}
</style>

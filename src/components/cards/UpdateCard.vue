<template>
  <v-card
    color="grey-darken-3"
    variant="flat"
    class="update-card h-100"
  >
    <v-card-text class="pa-3">
      <div class="text-subtitle-2 mb-3 d-flex align-center justify-space-between ga-2">
        <span>{{ $t('system.updates.title') }}</span>

        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          :loading="isChecking"
          :disabled="isUpdating"
          :title="$t('system.updates.refresh')"
          @click="refresh"
        />
      </div>

      <div
        v-if="managers.length === 0"
        class="text-caption text-grey-lighten-1"
      >
        {{ $t('system.updates.noState') }}
      </div>

      <v-list
        v-else
        bg-color="transparent"
        class="pa-0"
      >
        <template
          v-for="(manager, index) in managers"
          :key="manager.name"
        >
          <v-list-item class="px-0 py-2">
            <template #prepend>
              <v-icon
                :icon="manager.type === 'git' ? 'mdi-git' : 'mdi-package-variant'"
                :color="manager.update_available ? 'warning' : 'success'"
                class="mr-3"
              />
            </template>

            <v-list-item-title class="d-flex align-center flex-wrap ga-2">
              <span>{{ manager.name }}</span>

              <v-chip
                size="x-small"
                variant="tonal"
                :color="manager.update_available ? 'warning' : 'success'"
              >
                {{
                  manager.update_available
                    ? $t('system.updates.available')
                    : $t('system.updates.upToDate')
                }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              <template v-if="manager.name === 'system'">
                {{ $t('system.updates.packageCount', { count: manager.updates?.length ?? 0 }) }}
              </template>

              <template v-else-if="manager.type === 'git'">
                {{ gitVersion(manager) }}
              </template>

              <template v-else>
                {{ aptVersion(manager) }}
              </template>
            </v-list-item-subtitle>

            <div
              v-if="manager.error"
              class="text-caption text-error mt-1"
            >
              {{ manager.error }}
            </div>

            <template #append>
              <v-progress-circular
                v-if="manager.checking && !manager.updating"
                indeterminate
                size="20"
                width="2"
                class="mr-2"
              />

              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                :loading="manager.updating"
                :disabled="manager.checking || manager.updating || !manager.update_available"
                @click="update(manager.name)"
              >
                {{ $t('system.updates.update') }}
              </v-btn>
            </template>
          </v-list-item>

          <div
            v-if="manager.name === 'system' && manager.updates?.length"
            class="update-card__packages ml-9 mb-2"
          >
            <div
              v-for="pkg in manager.updates"
              :key="pkg.package"
              class="update-card__package"
            >
              <span class="text-caption">{{ pkg.package }}</span>
              <span class="text-caption text-grey-lighten-1">
                {{ pkg.current_version || '—' }} → {{ pkg.latest_version || '—' }}
              </span>
            </div>
          </div>

          <v-divider v-if="index < managers.length - 1" />
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

type AptUpdate = {
  package: string
  current_version?: string
  latest_version?: string
}

type UpdateManager = {
  name: string
  type: 'git' | 'apt'
  current_version?: string
  latest_version?: string
  commit?: string
  latest_commit?: string
  updates?: AptUpdate[]
  update_available: boolean
  checking: boolean
  updating: boolean
  error?: string
}

export default {
  name: 'UpdateCard',

  computed: {
    appStore() {
      return useAppStore()
    },

    updateManager(): Record<string, UpdateManager> {
      return this.appStore.getUpdateManager ?? {}
    },

    managers(): UpdateManager[] {
      return Object.entries(this.updateManager)
        .map(([name, manager]) => ({
          ...manager,
          name: manager?.name || name,
        }))
        .sort((a, b) => {
          if (a.name === 'system') return 1
          if (b.name === 'system') return -1
          return a.name.localeCompare(b.name)
        })
    },

    isChecking(): boolean {
      return this.managers.some(manager => manager.checking)
    },

    isUpdating(): boolean {
      return this.managers.some(manager => manager.updating)
    },
  },

  methods: {
    refresh() {
      void getWebsocketClient()?.send('update_refresh')
    },

    update(name: string) {
      void getWebsocketClient()?.send('update', { name })
    },

    gitVersion(manager: UpdateManager): string {
      const current = manager.current_version || manager.commit || '—'
      const latest = manager.latest_version || manager.latest_commit || current

      if (manager.update_available && current !== latest) {
        return `${current} → ${latest}`
      }

      if (manager.commit && !String(current).includes(manager.commit)) {
        return `${current} (${manager.commit})`
      }

      return current
    },

    aptVersion(manager: UpdateManager): string {
      const current = manager.current_version || '—'
      const latest = manager.latest_version || current

      return manager.update_available && current !== latest
        ? `${current} → ${latest}`
        : current
    },
  },
}
</script>

<style scoped>
.update-card {
  min-height: 116px;
}

.update-card__packages {
  display: grid;
  gap: 3px;
}

.update-card__package {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.update-card__package > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-card__package > span:last-child {
  white-space: nowrap;
}
</style>

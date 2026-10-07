<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-server-outline" />
        {{ $t('dashboard.customize.cards.system_status') }}
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text class="pt-3">
      <div class="system-grid">
        <div class="system-stat">
          <v-icon icon="mdi-cpu-64-bit" size="20" />
          <div class="min-width-0">
            <div class="text-caption text-medium-emphasis">{{ $t('dashboard.system.cpuLoad') }}</div>
            <div class="text-subtitle-1 font-weight-medium">{{ loadText }}</div>
          </div>
        </div>
        <div class="system-stat">
          <v-icon icon="mdi-thermometer" size="20" />
          <div class="min-width-0">
            <div class="text-caption text-medium-emphasis">{{ $t('dashboard.system.cpuTemp') }}</div>
            <div class="text-subtitle-1 font-weight-medium">{{ tempText }}</div>
          </div>
        </div>
      </div>

      <v-divider class="my-3" />

      <div v-if="configItems.length" class="system-config-list">
        <div v-for="item in configItems" :key="item.short" class="system-config-row">
          <div class="d-flex align-center ga-2 min-width-0">
            <v-icon :icon="item.icon" size="18" />
            <span class="text-body-2 text-truncate">{{ item.short }}</span>
          </div>
          <span class="text-body-2 text-medium-emphasis text-truncate">{{ item.data }}</span>
        </div>
      </div>
      <v-alert v-else density="compact" type="info" color="grey-darken-3" :text="$t('dashboard.system.noDetails')" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  name: 'DashboardSystemStatusCard',
  computed: {
    ...mapState(useAppStore, ['getSystemInfo']),
    loadText(): string {
      const value = Number((this.getSystemInfo as any)?.components?.load?.currentLoad)
      return Number.isFinite(value) ? `${Math.round(value)} %` : '—'
    },
    tempText(): string {
      const value = Number((this.getSystemInfo as any)?.components?.cpu?.temp?.main)
      return Number.isFinite(value) ? `${Math.round(value)} °C` : '—'
    },
    configItems(): any[] {
      const raw = (this.getSystemInfo as any)?.config
      const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : []
      return list
        .filter((item: any) => item && (item.short || item.data))
        .slice(0, 6)
        .map((item: any) => ({
          short: String(item.short ?? item.name ?? ''),
          data: String(item.data ?? item.value ?? ''),
          icon: item.icon ? `mdi-${String(item.icon).replace(/^mdi-/, '')}` : 'mdi-information-outline',
        }))
    },
  },
}
</script>

<style scoped>
.system-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.system-stat { display:flex; align-items:center; gap:10px; min-width:0; padding:10px 12px; border-radius:10px; background:rgba(var(--v-theme-surface-variant),.28); }
.system-config-list { display:grid; gap:4px; }
.system-config-row { display:flex; justify-content:space-between; align-items:center; gap:12px; min-height:36px; padding:4px 6px; }
.min-width-0 { min-width:0; }
@media (max-width: 520px) { .system-grid { grid-template-columns:1fr; } }
</style>

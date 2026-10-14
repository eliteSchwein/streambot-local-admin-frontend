<template>
  <v-btn
    class="mr-1 system-info-navbar-button"
    @click="openSystemPage"
    color="grey-darken-4"
    variant="flat"
  >
    <span v-if="metricEnabled('cpu_load')" class="system-info-navbar-entry ubuntu-mono" :title="$t('settings.topNavbar.systemInfoMetrics.cpuLoad')">
      <v-icon size="18" icon="mdi-cpu-64-bit" />
      <span class="system-info-navbar-value">{{ formatPercent(getSystemInfo?.components?.load?.currentLoad) }}</span>
    </span>
    <span v-if="metricEnabled('cpu_temp')" class="system-info-navbar-entry ubuntu-mono" :title="$t('settings.topNavbar.systemInfoMetrics.cpuTemp')">
      <v-icon size="18" icon="mdi-thermometer" />
      <span class="system-info-navbar-value">{{ formatTemperature(getSystemInfo?.components?.cpu?.temp?.main) }}</span>
    </span>
    <span v-if="metricEnabled('memory')" class="system-info-navbar-entry ubuntu-mono" :title="$t('settings.topNavbar.systemInfoMetrics.memory')">
      <v-icon size="18" icon="mdi-memory" />
      <span class="system-info-navbar-value">{{ formatPercent(getSystemInfo?.components?.memory?.usage_percent) }}</span>
    </span>
    <span v-if="metricEnabled('internal_storage')" class="system-info-navbar-entry ubuntu-mono" :title="$t('settings.topNavbar.systemInfoMetrics.internalStorage')">
      <v-icon size="18" icon="mdi-harddisk" />
      <span class="system-info-navbar-value">{{ formatPercent(getSystemInfo?.components?.storage?.internal?.usage_percent) }}</span>
    </span>
    <span v-if="metricEnabled('external_storage') && externalStorageEntries.length" class="system-info-navbar-entry ubuntu-mono" :title="$t('settings.topNavbar.systemInfoMetrics.externalStorage')">
      <v-icon size="18" icon="mdi-usb" />
      <span class="system-info-navbar-value">{{ formatPercent(externalStorageEntries[0]?.usage_percent) }}</span>
      <v-tooltip v-if="externalStorageEntries.length > 1" activator="parent" location="bottom">
        <div v-for="storage in externalStorageEntries" :key="`${storage.fs}-${storage.mount}`">
          {{ storage.mount || storage.fs }}: {{ formatPercent(storage.usage_percent) }}
        </div>
      </v-tooltip>
    </span>
  </v-btn>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  name: 'NavbarSystemInfoButton',
  computed: {
    ...mapState(useAppStore, ['getSystemInfo', 'getSettings']),
    selectedMetrics(): string[] {
      const configured = this.getSettings?.local_admin_panel?.system_info?.metrics
      return Array.isArray(configured) ? configured.map(String) : ['cpu_load', 'memory', 'internal_storage']
    },
    externalStorageEntries(): any[] {
      const entries = this.getSystemInfo?.components?.storage?.external
      return Array.isArray(entries) ? entries : []
    },
  },
  methods: {
    openSystemPage() { this.$router.push('/system') },
    metricEnabled(key: string) { return this.selectedMetrics.includes(key) },
    formatPercent(value: any) {
      const number = Number(value)
      return Number.isFinite(number) ? `${Math.round(number)} %` : '—'
    },
    formatTemperature(value: any) {
      const number = Number(value)
      return Number.isFinite(number) ? `${Math.round(number)} °C` : '—'
    },
  },
}
</script>

<style scoped>
.system-info-navbar-button { min-width: 0; }
.system-info-navbar-entry { display: inline-flex; align-items: center; gap: 4px; }
.system-info-navbar-entry + .system-info-navbar-entry { margin-left: 10px; }
.system-info-navbar-value {
  display: inline-block;
  min-width: 4.8ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
</style>

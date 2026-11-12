<template>
  <v-btn v-if="hasUpdateInProgress" class="mr-1 update-progress-button" color="grey-darken-4" variant="flat" :to="{ path: '/system' }" :active="false" :title="updateInProgressTitle">
    <v-progress-circular :indeterminate="progressPercent === undefined" :model-value="progressPercent ?? 0" color="primary" size="18" width="2" />
    <p class="text-primary ml-2 ubuntu-mono">{{ updateInProgressTitle }}</p>
  </v-btn>
  <v-btn v-else-if="hasAvailableUpdates" class="mr-1" color="grey-darken-4" variant="flat" :to="{ path: '/system' }" :active="false" :title="$t('navigation.status.updatesAvailable')">
    <v-icon icon="mdi-update" color="warning" />
    <p class="text-warning ml-2 ubuntu-mono">{{ $t('navigation.status.updatesAvailable') }}</p>
  </v-btn>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default {
  name: 'NavbarUpdateStatus',
  computed: {
    ...mapState(useAppStore, ['getUpdateManager']),
    hasAvailableUpdates(): boolean { return Object.values(this.getUpdateManager ?? {}).some((m:any) => m?.update_available === true) },
    updatingManagers(): string[] { return Object.entries(this.getUpdateManager ?? {}).filter(([,m]:any) => m?.updating === true).map(([n,m]:any) => m?.name || n) },
    hasUpdateInProgress(): boolean { return this.updatingManagers.length > 0 },
    // Average overall progress of all running updates that report a percentage.
    progressPercent(): number | undefined {
      const percents = Object.values(this.getUpdateManager ?? {})
        .filter((m:any) => m?.updating === true && typeof m?.progress?.percent === 'number')
        .map((m:any) => Number(m.progress.percent))
      if (!percents.length) return undefined
      return percents.reduce((sum, value) => sum + value, 0) / percents.length
    },
    updateInProgressTitle(): string {
      const title = this.updatingManagers.length ? this.$t('navigation.status.updateInProgressManager', { manager: this.updatingManagers.join(', ') }) as string : this.$t('navigation.status.updateInProgress') as string
      return this.progressPercent === undefined ? title : `${title} ${Math.round(this.progressPercent)}%`
    },
  },
}
</script>
<style scoped>.update-progress-button { min-width: 190px; }</style>

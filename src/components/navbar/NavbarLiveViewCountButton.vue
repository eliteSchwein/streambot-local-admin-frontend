<template>
  <v-btn class="mr-1" color="grey-darken-4" variant="flat" :title="$t('settings.topNavbar.items.liveViewers')">
    <v-icon icon="mdi-account-eye-outline" :color="isLive ? 'red-lighten-1' : undefined" />
    <p class="ml-2 ubuntu-mono viewer-count">{{ viewerCount }}</p>
  </v-btn>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default {
  name: 'NavbarLiveViewCountButton',
  computed: {
    ...mapState(useAppStore, ['getTwitchData']),
    isLive(): boolean { return Boolean(this.getTwitchData?.live) },
    viewerCount(): string {
      const value = Number(this.getTwitchData?.live?.viewer_count)
      return this.isLive && Number.isFinite(value) ? String(Math.max(0, Math.round(value))) : '—'
    },
  },
}
</script>
<style scoped>
.viewer-count { min-width: 3ch; text-align: right; font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
</style>

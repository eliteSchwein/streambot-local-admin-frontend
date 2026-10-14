<template>
  <v-btn
    class="mr-1 live-status-button"
    color="grey-darken-4"
    variant="flat"
    :title="$t('settings.topNavbar.items.liveStatus')"
  >
    <v-icon
      :icon="isLive ? 'mdi-broadcast' : 'mdi-broadcast-off'"
      :color="isLive ? 'red-lighten-1' : undefined"
    />
    <span class="ml-2 ubuntu-mono live-status-label">
      {{ isLive ? $t('settings.topNavbar.liveStatus.live') : $t('settings.topNavbar.liveStatus.offline') }}
    </span>
  </v-btn>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  name: 'NavbarLiveStatusButton',
  computed: {
    ...mapState(useAppStore, ['getTwitchData']),
    isLive(): boolean {
      return Boolean(this.getTwitchData?.live)
    },
  },
}
</script>

<style scoped>
.live-status-label {
  min-width: 7ch;
  text-align: left;
}
</style>

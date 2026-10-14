<template>
  <v-btn
    class="mr-1"
    color="grey-darken-4"
    variant="flat"
    :to="{ path: '/connections' }"
    :active="false"
    active-class=""
    :title="$t('settings.topNavbar.items.connections')"
  >
    <v-icon icon="mdi-webhook" />
    <p class="ml-2 ubuntu-mono">{{ Object.keys(getConnections ?? {}).length }}</p>
  </v-btn>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

export default {
  name: 'NavbarConnectionsButton',
  computed: {
    ...mapState(useAppStore, ['getConnections']),
  },
}
</script>

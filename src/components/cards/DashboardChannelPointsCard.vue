<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-star-circle-outline" />
        {{ $t('dashboard.customize.cards.channel_points') }}
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text class="pa-2">
      <v-alert v-if="points.length === 0" type="info" color="grey-darken-3" density="compact">
        {{ $t('channelPoints.none') }}
      </v-alert>

      <div v-else class="dashboard-channel-points">
        <div v-for="point in points" :key="point.id ?? point.name" class="dashboard-channel-point-row">
          <div class="d-flex align-center ga-2 min-width-0 flex-grow-1">
            <v-avatar size="36" rounded="lg" :color="point.active === false ? 'grey-darken-3' : (point.background || 'grey-darken-4')" class="pa-1 flex-shrink-0">
              <v-img v-if="point.image" :src="point.image" cover />
              <v-icon v-else icon="mdi-star-circle" size="19" />
            </v-avatar>
            <div class="min-width-0 flex-grow-1">
              <div class="text-body-2 text-truncate" :title="point.label ?? point.name">{{ point.label ?? point.name }}</div>
              <div v-if="point.name && point.label && point.name !== point.label" class="text-caption text-medium-emphasis text-truncate">{{ point.name }}</div>
            </div>
          </div>
          <v-switch
            :model-value="point.active !== false"
            :loading="toggling === String(point.id ?? point.name)"
            density="compact"
            hide-details
            inset
            color="primary"
            class="flex-shrink-0"
            @update:model-value="togglePoint(point)"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

export default {
  name: 'DashboardChannelPointsCard',
  data() { return { toggling: '' } },
  computed: {
    ...mapState(useAppStore, ['getChannelPoints']),
    points(): any[] {
      const data: any = this.getChannelPoints ?? {}
      const all = Array.isArray(data.all) ? data.all : []
      return [...all].sort((a, b) => String(a?.label ?? a?.name ?? '').localeCompare(String(b?.label ?? b?.name ?? '')))
    },
  },
  methods: {
    async togglePoint(point: any) {
      if (!point?.id || this.toggling) return
      this.toggling = String(point.id ?? point.name)
      try {
        const client = getWebsocketClient()
        if (!client) return
        await client.request('toggle_channel_point', { channel_point: point, state: 'toggle', active: point.active }, 30_000)
        point.active = !point.active
      } finally {
        this.toggling = ''
      }
    },
  },
}
</script>

<style scoped>
.dashboard-channel-points { display:flex; flex-direction:column; gap:6px; }
.dashboard-channel-point-row { display:flex; align-items:center; gap:10px; min-height:52px; padding:6px 8px; border-radius:8px; background:rgba(var(--v-theme-grey-darken-4),.72); }
.min-width-0 { min-width:0; }
</style>

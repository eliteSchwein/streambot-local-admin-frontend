<template>
  <v-card
    class="overflow-auto mx-auto"
    max-height="100%"
    elevation="0"
    color="transparent"
    max-width="100%"
  >
    <v-container fluid>
      <div v-if="layoutColumns === 3" class="system-page-grid system-page-grid--three">
        <div class="system-page-stack">
          <SystemInformationCard />
          <SpeedtestCard />
        </div>

        <div class="system-page-stack">
          <StorageCard
            show-segmented-bar
            show-legend-table
          />
          <SystemMaintenanceCard />
        </div>

        <div class="system-page-stack">
          <UpdateCard />
        </div>
      </div>

      <div v-else-if="layoutColumns === 2" class="system-page-grid system-page-grid--two">
        <div class="system-page-stack">
          <SystemInformationCard />
          <StorageCard
            show-segmented-bar
            show-legend-table
          />
        </div>

        <div class="system-page-stack">
          <UpdateCard />
          <SpeedtestCard />
          <SystemMaintenanceCard />
        </div>
      </div>

      <div v-else class="system-page-stack">
        <SystemInformationCard />
        <StorageCard
          show-segmented-bar
          show-legend-table
        />
        <UpdateCard />
        <SpeedtestCard />
        <SystemMaintenanceCard />
      </div>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import SystemInformationCard from '@/components/cards/SystemInformationCard.vue'
import StorageCard from '@/components/cards/StorageCard.vue'
import UpdateCard from '@/components/cards/UpdateCard.vue'
import SpeedtestCard from '@/components/cards/SpeedtestCard.vue'
import SystemMaintenanceCard from '@/components/cards/SystemMaintenanceCard.vue'

export default {
  name: 'SystemPage',

  components: {
    SystemInformationCard,
    StorageCard,
    UpdateCard,
    SpeedtestCard,
    SystemMaintenanceCard,
  },

  data() {
    return {
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    }
  },

  computed: {
    layoutColumns(): number {
      if (this.viewportWidth >= 1500) return 3
      if (this.viewportWidth >= 960) return 2
      return 1
    },
  },

  mounted() {
    window.addEventListener('resize', this.updateViewportWidth, { passive: true })
    this.updateViewportWidth()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateViewportWidth)
  },

  methods: {
    updateViewportWidth() {
      this.viewportWidth = window.innerWidth
    },
  },
}
</script>

<style scoped>
.system-page-grid {
  display: grid;
  align-items: start;
  gap: 16px;
}

.system-page-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.system-page-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.system-page-stack {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}
</style>

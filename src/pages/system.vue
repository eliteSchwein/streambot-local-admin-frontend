<template>
  <v-card
    class="overflow-auto mx-auto"
    max-height="100%"
    elevation="0"
    color="transparent"
    max-width="100%"
  >
    <v-container fluid>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <StorageCard
            show-segmented-bar
            show-legend-table
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <UpdateCard />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import StorageCard from '@/components/cards/StorageCard.vue'
import UpdateCard from '@/components/cards/UpdateCard.vue'

export default {
  name: 'SystemPage',

  components: {
    StorageCard,
    UpdateCard,
  },
}
</script>

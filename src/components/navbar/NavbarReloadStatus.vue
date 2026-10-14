<template>
  <v-btn v-if="getReloadUpdate?.finished === false" class="mr-1" color="grey-darken-4" variant="flat" style="min-width: 150px;">
    <v-progress-circular indeterminate color="primary" size="18" width="2" />
    <p class="text-primary ml-2 ubuntu-mono">{{ $t('navigation.status.savingPleaseWait') }}</p>
  </v-btn>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default { name: 'NavbarReloadStatus', computed: { ...mapState(useAppStore, ['getReloadUpdate']) } }
</script>

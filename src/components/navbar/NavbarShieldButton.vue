<template>
  <v-btn class="mr-1" color="grey-darken-4" variant="flat" :title="$t('settings.topNavbar.items.shield')">
    <v-icon :icon="isShieldActive ? 'mdi-shield' : 'mdi-shield-outline'" :color="isShieldActive ? 'error' : undefined" />
    <p class="ml-2 ubuntu-mono" :class="{ 'text-error': isShieldActive }">{{ $t('navigation.status.shield') }}</p>
  </v-btn>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default { name: 'NavbarShieldButton', computed: { ...mapState(useAppStore, ['isShieldActive']) } }
</script>

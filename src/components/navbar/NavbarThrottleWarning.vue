<template>
  <v-btn v-if="isThrottled" class="mr-1" color="grey-darken-4" variant="flat">
    <v-icon icon="mdi-flash" color="warning" />
    <p class="text-warning ml-2">{{ $t('navigation.status.throttled') }}</p>
  </v-btn>
</template>
<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default { name: 'NavbarThrottleWarning', computed: { ...mapState(useAppStore, ['isThrottled']) } }
</script>

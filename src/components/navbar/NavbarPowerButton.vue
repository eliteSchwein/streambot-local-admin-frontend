<template>
  <v-btn class="topbar-icon-button" variant="text" :title="$t('navigation.actions.power')" @click="showPowerMenu">
    <v-icon icon="mdi-power" size="26" />
  </v-btn>
</template>
<script lang="ts">
import eventBus from '@/eventBus'
export default { name: 'NavbarPowerButton', methods: { showPowerMenu() { eventBus.$emit('dialog:show', 'power') } } }
</script>
<style scoped>.topbar-icon-button { min-width: 36px !important; width: 36px; padding-inline: 0 !important; }</style>

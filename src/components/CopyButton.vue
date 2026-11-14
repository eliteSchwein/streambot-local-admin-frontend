<script setup lang="ts">
import { ref } from 'vue'
import eventBus from "@/eventBus.ts";
import { copyText } from '@/helper/ClipboardHelper'

const props = defineProps(['content'])
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

async function copyToClipboard() {
  const text = String(props.content ?? '')
  // Kept for existing listeners of this event.
  eventBus.$emit('config:write', text)

  copied.value = await copyText(text)
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <v-btn
    :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
    :color="copied ? 'success' : undefined"
    size="x-small"
    @click="copyToClipboard"
  ></v-btn>
</template>

<style scoped lang="scss">

</style>

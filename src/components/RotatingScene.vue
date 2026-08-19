<template>
  <div class="rotating-scene-row">
    <div class="rotating-scene-row__content">
      <div
        class="rotating-scene-row__name text-truncate"
        :title="rotatingSceneName"
      >
        {{ rotatingSceneName }}
      </div>

      <v-chip
        size="x-small"
        variant="tonal"
        class="rotating-scene-row__chip"
        prepend-icon="mdi-clock-outline"
      >
        {{ intervalLabel }}
      </v-chip>

      <v-chip
        size="x-small"
        variant="tonal"
        class="rotating-scene-row__chip"
        prepend-icon="mdi-video-switch"
      >
        {{ $t('components.rotatingScene.sceneCount', { count: sceneCount }) }}
      </v-chip>
    </div>

    <div class="rotating-scene-row__actions">
      <v-btn
        size="small"
        variant="tonal"
        color="primary"
        @click.stop="$emit('edit', rotatingScene)"
      >
        <v-icon icon="mdi-pencil" />
        <span class="d-none d-sm-inline ml-1">
          {{ $t('common.edit') }}
        </span>
      </v-btn>

      <v-btn
        size="small"
        variant="tonal"
        color="red"
        @click.stop="$emit('delete', rotatingScene)"
      >
        <v-icon icon="mdi-delete" />
        <span class="d-none d-sm-inline ml-1">
          {{ $t('common.delete') }}
        </span>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rotatingScene: any
}>()

defineEmits<{
  edit: [rotatingScene: any]
  delete: [rotatingScene: any]
}>()

const rotatingSceneName = computed(() => String(props.rotatingScene?.name ?? ''))

const sceneItems = computed(() => {
  const scenes = props.rotatingScene?.scenes
  return Array.isArray(scenes) ? scenes : []
})

const sceneCount = computed(() => sceneItems.value.length)

const intervalLabel = computed(() => formatDuration(Number(props.rotatingScene?.interval ?? 0) * 60))

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) return `${hours}h ${remainingMinutes}m`
  if (minutes > 0) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  return `${seconds}s`
}
</script>

<style scoped lang="scss">
.rotating-scene-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 8px 14px;
  background: rgb(var(--v-theme-grey-darken-4));
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.rotating-scene-row__content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}

.rotating-scene-row__name {
  min-width: 0;
  font-weight: 500;
}

.rotating-scene-row__chip {
  flex: 0 0 auto;
}

.rotating-scene-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

@media (max-width: 600px) {
  .rotating-scene-row {
    padding-inline: 10px;
  }

  .rotating-scene-row__content {
    gap: 6px;
  }

  .rotating-scene-row__actions {
    gap: 4px;
  }

  .rotating-scene-row__actions .v-btn {
    min-width: 36px;
    padding-inline: 8px;
  }
}
</style>

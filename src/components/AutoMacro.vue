<script setup lang="ts">
import { computed } from 'vue'
import { getWebsocketClient } from '@/plugins/websocketInstance'

const props = withDefaults(defineProps<{
  autoMacro: any
  mode?: 'dashboard' | 'editor'
  disabled?: boolean
  deleting?: boolean
}>(), {
  mode: 'dashboard',
  disabled: false,
  deleting: false,
})

const emit = defineEmits<{
  edit: [autoMacro: any]
  delete: [autoMacro: any]
}>()

const isDashboardMode = computed(() => props.mode === 'dashboard')
const autoMacroName = computed(() => String(props.autoMacro?.name ?? ''))

const progressValue = computed(() => {
  const interval = Number(props.autoMacro?.interval ?? 0)
  const currentInterval = Number(props.autoMacro?.current_interval ?? 0)

  if (!interval || interval <= 0) return 0
  return Math.max(0, Math.min(100, (100 / interval) * currentInterval))
})

const intervalLabel = computed(() => formatDuration(Number(props.autoMacro?.interval ?? 0)))

const macroList = computed(() => {
  const macros = props.autoMacro?.macros
  return Array.isArray(macros) ? macros.map((macro: any) => String(macro)) : []
})

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

function toggleAutoMacro(value: boolean | null) {
  if (props.disabled) return

  const enabled = value === true

  getWebsocketClient()?.send('toggle_auto_macro', {
    name: autoMacroName.value,
    enable: enabled,
    enabled,
  })
}
</script>

<template>
  <v-toolbar
    v-if="isDashboardMode"
    flat
    density="compact"
    rounded
    class="auto-macro-dashboard mb-2"
  >
    <v-toolbar-title class="d-flex align-center min-width-0" style="font-size: 1rem">
      <span class="text-truncate">{{ autoMacroName }}</span>
    </v-toolbar-title>

    <v-progress-linear
      :active="autoMacro?.enabled === true"
      :model-value="progressValue"
      location="bottom"
      absolute
      rounded
      color="grey-darken-1"
    />

    <template #append>
      <v-switch
        hide-details
        density="compact"
        class="mr-3"
        :model-value="autoMacro?.enabled === true"
        @update:model-value="toggleAutoMacro"
        @click.stop
      />
    </template>
  </v-toolbar>

  <div v-else class="auto-macro-row">
    <div class="auto-macro-row__content">
      <div class="auto-macro-row__name text-truncate" :title="autoMacroName">
        {{ autoMacroName }}
      </div>

      <v-chip
        size="x-small"
        variant="tonal"
        class="auto-macro-row__chip"
        prepend-icon="mdi-clock-outline"
      >
        {{ intervalLabel }}
      </v-chip>

      <v-chip
        size="x-small"
        variant="tonal"
        class="auto-macro-row__chip"
      >
        {{ macroList.length }} macros
      </v-chip>
    </div>

    <div class="auto-macro-row__actions">
      <v-switch
        :model-value="autoMacro?.enabled === true"
        :disabled="disabled"
        density="compact"
        hide-details
        inset
        color="primary"
        class="auto-macro-row__toggle"
        @update:model-value="toggleAutoMacro"
        @click.stop
      />

      <v-btn
        size="small"
        variant="tonal"
        color="primary"
        :disabled="disabled"
        @click.stop="emit('edit', autoMacro)"
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
        :loading="deleting"
        :disabled="disabled"
        @click.stop="emit('delete', autoMacro)"
      >
        <v-icon icon="mdi-delete" />
        <span class="d-none d-sm-inline ml-1">
          {{ $t('common.delete') }}
        </span>
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auto-macro-dashboard {
  min-height: 48px;
}

.auto-macro-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 8px 14px;
  background: rgb(var(--v-theme-grey-darken-4));
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.auto-macro-row__content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}

.auto-macro-row__name {
  min-width: 0;
  font-weight: 500;
}

.auto-macro-row__chip,
.auto-macro-row__toggle {
  flex: 0 0 auto;
}

.auto-macro-row__toggle {
  margin-right: 2px;
}

.auto-macro-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 600px) {
  .auto-macro-row {
    padding-inline: 10px;
  }

  .auto-macro-row__content {
    gap: 6px;
  }

  .auto-macro-row__actions {
    gap: 4px;
  }

  .auto-macro-row__actions .v-btn {
    min-width: 36px;
    padding-inline: 8px;
  }
}
</style>

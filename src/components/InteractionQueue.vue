<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import { formatSeconds } from '@/helper/GeneralHelper'

export type InteractionSource = 'command' | 'event' | 'channel_point' | 'api' | 'other'
export type InteractionState = 'queued' | 'active' | 'finished' | 'cancelled' | 'failed'

export type Interaction = {
  uuid: string
  name: string
  source: InteractionSource
  state: InteractionState
  created_at: string
  started_at?: string
  finished_at?: string
  duration: number
  eta: string | null
  eta_seconds: number
  alert_count: number
  error?: string
}

const store = useAppStore()
const { getInteractions } = storeToRefs(store)

const interactions = computed<Interaction[]>(() => Array.isArray(getInteractions.value) ? getInteractions.value : [])

const sourceIcons: Record<InteractionSource, string> = {
  command: 'mdi-console-line',
  event: 'mdi-lightning-bolt',
  channel_point: 'mdi-star-circle',
  api: 'mdi-api',
  other: 'mdi-play-circle-outline',
}

const stateIcons: Record<InteractionState, string> = {
  queued: 'mdi-clock-outline',
  active: 'mdi-play-circle',
  finished: 'mdi-check-circle',
  cancelled: 'mdi-cancel',
  failed: 'mdi-alert-circle',
}

function sourceIcon(source: InteractionSource) {
  return sourceIcons[source] ?? sourceIcons.other
}

function stateIcon(state: InteractionState) {
  return stateIcons[state] ?? 'mdi-help-circle-outline'
}

function stateColor(state: InteractionState) {
  switch (state) {
    case 'active': return 'success'
    case 'failed': return 'error'
    case 'cancelled': return 'warning'
    case 'finished': return 'success'
    default: return 'grey'
  }
}

function progress(interaction: Interaction) {
  if (interaction.state !== 'active' || interaction.duration <= 0) return 0
  return Math.max(0, Math.min(100, ((interaction.duration - interaction.eta_seconds) / interaction.duration) * 100))
}

function removeInteraction(uuid: string) {
  getWebsocketClient()?.send('remove_interaction', { uuid })
}
</script>

<template>
  <v-card color="transparent" variant="flat">
    <v-card v-if="interactions.length === 0" color="grey-darken-3" rounded="3" variant="flat">
      <v-card-text class="text-medium-emphasis py-5">
        <div class="d-flex align-center ga-2">
          <v-icon color="white" icon="mdi-check-circle-outline" />
          <span>{{ $t('interactions.empty') }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-list v-else bg-color="transparent" class="interaction-list py-0">
      <template v-for="interaction in interactions" :key="interaction.uuid">
        <v-list-item
          class="interaction-item py-3 rounded"
          :class="interaction.state === 'active' ? 'bg-green-darken-2' : 'bg-grey-darken-3'"
        >
          <template #prepend>
            <v-avatar color="grey-darken-4" variant="tonal">
              <v-icon color="white" :icon="sourceIcon(interaction.source)" />
            </v-avatar>
          </template>

          <v-list-item-title class="d-flex align-center ga-2 flex-wrap">
            <span class="font-weight-medium">{{ interaction.name }}</span>
            <v-chip
              v-if="interaction.state !== 'active'"
              size="x-small"
              :color="stateColor(interaction.state)"
              variant="tonal"
              :prepend-icon="stateIcon(interaction.state)"
            >
              {{ $t(`interactions.states.${interaction.state}`) }}
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle class="interaction-meta mt-1">
            <span>
              <v-icon color="white" size="small" :icon="sourceIcon(interaction.source)" />
              {{ $t(`interactions.sources.${interaction.source}`) }}
            </span>
            <span v-if="interaction.duration > 0">
              <v-icon color="white" size="small" icon="mdi-timer-outline" />
              {{ $t('interactions.duration', { duration: formatSeconds(interaction.duration) }) }}
            </span>
            <span v-if="interaction.eta_seconds > 0">
              <v-icon color="white" size="small" icon="mdi-clock-fast" />
              {{ $t('interactions.eta', { duration: formatSeconds(interaction.eta_seconds) }) }}
            </span>
            <span v-else-if="interaction.state === 'active'">
              <v-icon color="white" size="small" icon="mdi-progress-clock" />
              {{ $t('interactions.pleaseWait') }}
            </span>
            <span v-if="interaction.alert_count > 0">
              <v-icon color="white" size="small" icon="mdi-bell-outline" />
              {{ $t('interactions.alertCount', { count: interaction.alert_count }) }}
            </span>
          </v-list-item-subtitle>

          <v-progress-linear
            v-if="interaction.state === 'active' && interaction.duration > 0"
            class="mt-2"
            :model-value="progress(interaction)"
            color="white"
            rounded
            height="4"
          />

          <div v-if="interaction.error" class="text-error text-caption mt-2">
            <v-icon color="white" size="small" icon="mdi-alert-circle-outline" />
            {{ interaction.error }}
          </div>

          <template #append>
            <v-btn
              icon="mdi-close"
              :variant="interaction.state === 'active' ? 'tonal' : 'text'"
              :color="interaction.state === 'active' ? 'white' : 'error'"
              size="small"
              :title="$t('interactions.cancel')"
              @click.stop="removeInteraction(interaction.uuid)"
            />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<style scoped lang="scss">
.interaction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interaction-item {
  min-height: 76px;
}

.interaction-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.interaction-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>

<template>
  <v-card color="grey-darken-3" variant="flat" class="system-information-card">
    <v-card-text class="pa-4">
      <div class="text-subtitle-2 mb-3">{{ $t('system.info.title') }}</div>

      <div class="system-information-card__content">
        <div class="system-information-card__rings" aria-hidden="true">
          <v-progress-circular
            class="system-information-card__ring"
            :model-value="cpuUsage"
            :size="126"
            :width="6"
            color="error"
            bg-color="grey-darken-4"
            rounded
          />
          <v-progress-circular
            class="system-information-card__ring"
            :model-value="memoryUsage"
            :size="104"
            :width="6"
            color="warning"
            bg-color="grey-darken-4"
            rounded
          />
          <v-progress-circular
            class="system-information-card__ring"
            :model-value="internalStorageUsage"
            :size="82"
            :width="6"
            color="info"
            bg-color="grey-darken-4"
            rounded
          />
          <div class="system-information-card__ring-center ubuntu-mono">
            {{ formatPercent(cpuUsage) }}
          </div>
        </div>

        <div class="system-information-card__values">
          <div class="system-information-card__value-row">
            <div class="system-information-card__value-label">
              <span class="system-information-card__dot bg-error" />
              <v-icon icon="mdi-cpu-64-bit" size="18" />
              <span>{{ $t('system.info.cpuUsage') }}</span>
            </div>
            <strong class="ubuntu-mono">{{ formatPercent(cpuUsage) }}</strong>
          </div>

          <div class="system-information-card__value-row">
            <div class="system-information-card__value-label">
              <span class="system-information-card__dot bg-warning" />
              <v-icon icon="mdi-memory" size="18" />
              <span>{{ $t('system.info.memoryUsage') }}</span>
            </div>
            <strong class="ubuntu-mono">{{ formatPercent(memoryUsage) }}</strong>
          </div>

          <div class="system-information-card__value-row">
            <div class="system-information-card__value-label">
              <span class="system-information-card__dot bg-info" />
              <v-icon icon="mdi-harddisk" size="18" />
              <span>{{ $t('system.info.internalStorage') }}</span>
            </div>
            <strong class="ubuntu-mono">{{ formatPercent(internalStorageUsage) }}</strong>
          </div>

          <v-divider class="my-2" />

          <div class="system-information-card__value-row">
            <div class="system-information-card__value-label">
              <v-icon icon="mdi-thermometer" size="18" />
              <span>{{ $t('system.info.temperature') }}</span>
            </div>
            <strong class="ubuntu-mono">{{ formatTemperature(cpuTemperature) }}</strong>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'

export default {
  name: 'SystemInformationCard',

  computed: {
    appStore() { return useAppStore() },
    components(): any { return this.appStore.getSystemInfo?.components ?? {} },
    cpuUsage(): number { return this.clampPercent(this.components?.load?.currentLoad) },
    memoryUsage(): number { return this.clampPercent(this.components?.memory?.usage_percent) },
    internalStorageUsage(): number { return this.clampPercent(this.components?.storage?.internal?.usage_percent) },
    cpuTemperature(): number | null {
      const value = Number(this.components?.cpu?.temp?.main)
      return Number.isFinite(value) ? value : null
    },
  },

  methods: {
    clampPercent(value: any) {
      const number = Number(value)
      return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0
    },
    formatPercent(value: any) {
      const number = Number(value)
      return Number.isFinite(number) ? `${Math.round(number)} %` : '—'
    },
    formatTemperature(value: any) {
      const number = Number(value)
      return Number.isFinite(number) ? `${Math.round(number)} °C` : '—'
    },
  },
}
</script>

<style scoped>
.system-information-card__content {
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 138px;
}
.system-information-card__rings {
  position: relative;
  width: 138px;
  height: 138px;
  flex: 0 0 138px;
}
.system-information-card__ring {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}
.system-information-card__ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .95rem;
}
.system-information-card__values {
  flex: 1 1 auto;
  min-width: 0;
}
.system-information-card__value-row {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.system-information-card__value-label {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255,255,255,.72);
}
.system-information-card__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex: 0 0 auto;
}
.ubuntu-mono {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
@media (max-width: 540px) {
  .system-information-card__content { gap: 12px; }
  .system-information-card__rings { width: 120px; height: 120px; flex-basis: 120px; transform: scale(.87); margin: -9px; }
}
</style>

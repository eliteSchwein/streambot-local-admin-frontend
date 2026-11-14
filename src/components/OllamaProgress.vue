<template>
  <div class="ollama-progress">
    <div class="d-flex align-center justify-space-between ga-2 text-body-2">
      <span class="text-truncate">
        {{ title }}
      </span>
      <span
        v-if="progress?.percent !== undefined"
        class="text-grey-lighten-1 flex-shrink-0"
      >
        {{ formatPercent(progress.percent) }}
      </span>
    </div>

    <v-progress-linear
      :model-value="progress?.percent ?? 0"
      :indeterminate="progress?.percent === undefined"
      color="primary"
      bg-color="grey-darken-1"
      height="6"
      rounded
      class="mt-1"
    />

    <div
      v-if="detail"
      class="d-flex align-center justify-space-between ga-2 text-caption text-grey-lighten-1 mt-1"
    >
      <span
        class="ollama-progress__message"
        :title="progress?.message"
      >
        {{ progress?.message }}
      </span>
      <span class="flex-shrink-0">
        {{ detail }}
      </span>
    </div>

    <div
      v-else-if="progress?.message"
      class="ollama-progress__message text-caption text-grey mt-1"
      :title="progress.message"
    >
      {{ progress.message }}
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'

export type OllamaProgress = {
  stage: string
  percent?: number
  completed?: number
  total?: number
  unit?: 'bytes' | 'steps'
  model?: string
  message?: string
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

export default {
  name: 'OllamaProgress',

  props: {
    progress: {
      type: Object as PropType<OllamaProgress | null>,
      default: null,
    },
    // Shown before the stage, e.g. "Installing Ollama".
    label: {
      type: String,
      default: '',
    },
  },

  computed: {
    title(): string {
      const stage = this.progress?.stage
      const key = `integrations.ui.ollama.progress.stages.${stage}`
      const stageText = stage
        ? (this.$te(key) ? this.$t(key) as string : stage)
        : ''
      const model = this.progress?.model ? ` · ${this.progress.model}` : ''

      if (this.label && stageText) return `${this.label} · ${stageText}${model}`

      return `${this.label || stageText}${model}`
    },

    detail(): string {
      const progress = this.progress
      if (!progress?.total || progress.completed === undefined) return ''

      if (progress.unit === 'bytes') {
        return `${this.formatBytes(progress.completed)} / ${this.formatBytes(progress.total)}`
      }

      return `${progress.completed} / ${progress.total}`
    },
  },

  methods: {
    formatPercent(percent: number): string {
      return `${Math.round(Number(percent) || 0)}%`
    },

    formatBytes(bytes: number): string {
      let value = Number(bytes) || 0
      let unit = 0

      while (value >= 1000 && unit < BYTE_UNITS.length - 1) {
        value /= 1000
        unit++
      }

      return `${value.toFixed(unit >= 2 ? 1 : 0)} ${BYTE_UNITS[unit]}`
    },
  },
}
</script>

<style scoped>
.ollama-progress__message {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

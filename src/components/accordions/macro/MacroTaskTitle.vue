<template>
  <v-expansion-panel-title>
    <div class="d-flex align-center min-width-0 w-100">
      <v-icon :icon="icon" size="20" class="mr-2" />

      <span class="text-caption mr-2 text-medium-emphasis">
        #{{ index + 1 }}
      </span>

      <div class="d-flex align-center min-width-0 flex-grow-1">
        <span class="text-truncate font-weight-medium">
          {{ title }}
        </span>

        <template v-if="hasDetail">
          <span class="mx-2 text-medium-emphasis">·</span>
          <span
            v-if="detailHref && !detailIsEmpty"
            class="text-truncate macro-task-title__detail-link"
            @pointerdown.stop
            @mousedown.stop
            @click.stop.prevent="openDetail"
          >
            {{ displayDetail }}
          </span>
          <span
            v-else
            class="text-truncate"
            :class="detailIsEmpty ? 'text-medium-emphasis font-italic' : ''"
          >
            {{ displayDetail }}
          </span>
        </template>
      </div>

      <v-spacer />

      <v-btn
        size="small"
        variant="text"
        :disabled="!canMoveUp"
        @click.stop="$emit('move-up')"
      >
        <v-icon icon="mdi-arrow-up" size="16" />
      </v-btn>

      <v-btn
        class="mr-4"
        size="small"
        variant="text"
        :disabled="!canMoveDown"
        @click.stop="$emit('move-down')"
      >
        <v-icon icon="mdi-arrow-down" size="16" />
      </v-btn>
    </div>
  </v-expansion-panel-title>
</template>

<script lang="ts">
export default {
  name: 'MacroTaskTitle',

  props: {
    icon: { type: String, required: true },
    index: { type: Number, required: true },
    title: { type: String, required: true },
    detail: { type: [String, Number], default: undefined },
    detailHref: { type: String, default: '' },
    detailTarget: { type: String, default: '_blank' },
    canMoveUp: { type: Boolean, default: true },
    canMoveDown: { type: Boolean, default: true },
  },

  emits: ['move-up', 'move-down'],

  methods: {
    openDetail() {
      if (!this.detailHref) return
      window.open(this.detailHref, this.detailTarget || '_blank', 'noopener,noreferrer')
    },
  },

  computed: {
    hasDetail(): boolean {
      return this.detail !== undefined
    },

    normalizedDetail(): string {
      return String(this.detail ?? '').trim()
    },

    detailIsEmpty(): boolean {
      return this.hasDetail && !this.normalizedDetail
    },

    displayDetail(): string {
      return this.detailIsEmpty
        ? String(this.$t('macro.common.notSet'))
        : this.normalizedDetail
    },
  },
}
</script>

<style scoped>
.macro-task-title__detail-link {
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  text-decoration: none;
}

.macro-task-title__detail-link:hover {
  text-decoration: underline;
}
</style>

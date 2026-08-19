<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar color="warning" flat density="compact">
        <v-toolbar-title class="d-flex align-center">
          {{ $t('audio.presets.deleteConfirmTitle') }}
        </v-toolbar-title>

        <v-btn
          icon="mdi-close"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-card-text>
        <div class="mb-2">
          {{ $t('audio.presets.deleteConfirmText') }}
        </div>

        <v-card color="grey-darken-3" variant="flat" class="pa-3">
          <div class="d-flex align-center ga-3">
            <v-avatar
              size="40"
              color="grey-darken-2"
              rounded="lg"
            >
              <v-icon icon="mdi-tune-variant" size="20" />
            </v-avatar>

            <div class="min-width-0">
              <div
                class="text-truncate"
                :title="presetName"
              >
                {{ presetName }}
              </div>
            </div>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="warning"
          variant="flat"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ $t('common.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'AudioPresetDeleteConfirmDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    presetName: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'confirm'],
}
</script>

<style scoped>
.min-width-0 {
  min-width: 0;
}
</style>

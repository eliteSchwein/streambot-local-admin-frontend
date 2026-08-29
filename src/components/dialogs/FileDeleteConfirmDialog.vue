<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar color="warning" flat density="compact">
        <v-toolbar-title class="d-flex align-center">
          {{ resolvedTitle }}
        </v-toolbar-title>

        <v-btn icon="mdi-close" @click="close" />
      </v-toolbar>

      <v-card-text>
        <div class="mb-2">
          {{ resolvedText }}
        </div>

        <v-card color="grey-darken-3" variant="flat" class="pa-3">
          <div class="d-flex align-center ga-2 min-width-0 mb-3">
            <v-icon :icon="entry?.type === 'folder' ? 'mdi-folder' : 'mdi-file'" />

            <div
              class="text-truncate"
              :title="entry?.path || entry?.name"
            >
              {{ entry?.path || entry?.name }}
            </div>
          </div>

          <FilePreview
            v-if="entry"
            :entry="entry"
            :rest-api="restApi"
            :public-prefix="publicPrefix"
            variant="compact"
            :controls="true"
            :autoplay="false"
            :muted="true"
            :show-label="entry?.type !== 'folder'"
          />
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          :disabled="loading"
          @click="close"
        >
          {{ resolvedCancelLabel }}
        </v-btn>

        <v-btn
          color="warning"
          variant="flat"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ resolvedDeleteLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import FilePreview from '@/components/files/FilePreview.vue'

export default {
  name: 'FileDeleteConfirmDialog',

  components: {
    FilePreview,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },

    entry: {
      type: Object,
      default: null,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    restApi: {
      type: String,
      required: true,
    },

    publicPrefix: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },

    text: {
      type: String,
      default: '',
    },

    cancelLabel: {
      type: String,
      default: '',
    },

    deleteLabel: {
      type: String,
      default: '',
    },

    compressed: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'update:modelValue',
    'confirm',
  ],

  computed: {
    resolvedTitle(): string {
      if (this.title) return this.title

      return this.compressed
        ? this.$t('media.deleteCompressedConfirmTitle') as string
        : this.$t('media.deleteConfirmTitle') as string
    },

    resolvedText(): string {
      if (this.text) return this.text

      return this.compressed
        ? this.$t('media.deleteCompressedConfirmText') as string
        : this.$t('media.deleteConfirmText') as string
    },

    resolvedCancelLabel(): string {
      return this.cancelLabel
        || this.$t('common.cancel') as string
    },

    resolvedDeleteLabel(): string {
      if (this.deleteLabel) return this.deleteLabel

      return this.compressed
        ? this.$t('media.deleteCompressed') as string
        : this.$t('common.delete') as string
    },
  },

  methods: {
    close() {
      if (this.loading) return

      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.min-width-0 {
  min-width: 0;
}
</style>

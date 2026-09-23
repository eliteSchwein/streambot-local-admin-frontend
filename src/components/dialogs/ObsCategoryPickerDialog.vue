<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title>
          {{ $t('obs.settings.addToCategory') }}
        </v-toolbar-title>

        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('obs.settings.addToCategoryHint', { source: sourceName }) }}
        </div>

        <v-autocomplete
          v-model="internalCategoryId"
          v-model:search="search"
          :items="categories"
          item-title="title"
          item-value="value"
          :label="$t('obs.settings.category')"
          :placeholder="$t('obs.settings.searchCategory')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          autofocus
          clearable
          auto-select-first
          :menu-props="{ maxHeight: 360 }"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #append>
                <v-chip
                  v-if="isFallbackItem(item)"
                  size="x-small"
                  color="secondary"
                  variant="tonal"
                >
                  {{ $t('categoryLibrary.fallback') }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
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
          color="primary"
          variant="flat"
          prepend-icon="mdi-gamepad-variant-outline"
          :disabled="!internalCategoryId"
          :loading="loading"
          @click="confirm"
        >
          {{ $t('obs.settings.addToCategory') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'ObsCategoryPickerDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    selectedCategoryId: {
      type: String,
      default: '',
    },
    sourceName: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'update:modelValue',
    'update:selectedCategoryId',
    'confirm',
  ],

  data() {
    return {
      internalCategoryId: '',
      search: '',
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(open: boolean) {
        if (!open) return
        this.internalCategoryId = this.selectedCategoryId
        this.search = ''
      },
    },

    selectedCategoryId(value: string) {
      if (this.modelValue) this.internalCategoryId = value
    },

    internalCategoryId(value: string) {
      this.$emit('update:selectedCategoryId', value ?? '')
    },
  },

  methods: {
    isFallbackItem(item: any): boolean {
      const raw = item?.raw ?? item
      return raw?.isFallback === true
    },

    confirm() {
      if (!this.internalCategoryId || this.loading) return
      this.$emit('confirm', this.internalCategoryId)
    },
  },
}
</script>

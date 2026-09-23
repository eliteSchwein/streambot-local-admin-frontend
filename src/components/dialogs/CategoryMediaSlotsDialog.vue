<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1050"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center">
          <v-icon icon="mdi-view-grid-plus-outline" class="mr-2" />
          {{ $t('categoryLibrary.mediaSlots.title') }}
        </v-toolbar-title>

        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('categoryLibrary.mediaSlots.description') }}
        </div>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          :text="errorMessage"
        />

        <div
          v-for="(slot, index) in form"
          :key="index"
          class="media-slot pa-3 mb-3"
        >
          <v-row density="compact" align="center">
            <v-col cols="12" md="3">
              <v-text-field
                v-model="slot.name"
                :label="$t('categoryLibrary.mediaSlots.name')"
                :placeholder="$t('categoryLibrary.mediaSlots.namePlaceholder')"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="slot.target"
                :label="$t('categoryLibrary.mediaSlots.target')"
                :placeholder="$t('categoryLibrary.mediaSlots.targetPlaceholder')"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>

            <v-col cols="12" sm="8" md="3">
              <v-select
                v-model="slot.orientation"
                :items="orientationItems"
                item-title="title"
                item-value="value"
                :label="$t('categoryLibrary.mediaSlots.orientation')"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="4" md="3" class="d-flex justify-end">
              <v-btn
                color="error"
                variant="text"
                prepend-icon="mdi-delete-outline"
                @click="remove(index)"
              >
                {{ $t('common.delete') }}
              </v-btn>
            </v-col>

            <v-col cols="12">
              <div class="d-flex flex-wrap ga-4">
                <v-switch
                  v-model="slot.autoplay"
                  density="compact"
                  color="primary"
                  hide-details
                  :label="$t('categoryLibrary.editor.autoplay')"
                />
                <v-switch
                  v-model="slot.loop"
                  density="compact"
                  color="primary"
                  hide-details
                  :label="$t('categoryLibrary.editor.loop')"
                />
                <v-switch
                  v-model="slot.muted"
                  density="compact"
                  color="primary"
                  hide-details
                  :label="$t('categoryLibrary.editor.muted')"
                />
              </div>
            </v-col>
          </v-row>
        </div>

        <v-alert
          v-if="!form.length"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          {{ $t('categoryLibrary.mediaSlots.empty') }}
        </v-alert>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="add"
        >
          {{ $t('categoryLibrary.mediaSlots.add') }}
        </v-btn>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="!canSave"
          @click="submit"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'CategoryMediaSlotsDialog',

  props: {
    modelValue: { type: Boolean, default: false },
    slots: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'save'],

  data() {
    return {
      form: [] as any[],
      errorMessage: '',
    }
  },

  computed: {
    orientationItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('categoryLibrary.orientation.any')), value: 'any' },
        { title: String(this.$t('categoryLibrary.orientation.horizontal')), value: 'horizontal' },
        { title: String(this.$t('categoryLibrary.orientation.vertical')), value: 'vertical' },
      ]
    },

    canSave(): boolean {
      const names = this.form.map(slot => this.normalizeName(slot.name))
      return names.every(Boolean) && new Set(names).size === names.length
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(open: boolean) {
        if (open) this.reset()
      },
    },

    slots: {
      deep: true,
      handler() {
        if (this.modelValue) this.reset()
      },
    },
  },

  methods: {
    normalizeName(value: any): string {
      return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },

    reset() {
      this.errorMessage = ''
      this.form = (this.slots as any[]).map(slot => ({
        name: String(slot?.name ?? ''),
        target: String(slot?.target ?? ''),
        orientation: ['horizontal', 'vertical', 'any'].includes(String(slot?.orientation))
          ? slot.orientation
          : 'any',
        autoplay: slot?.autoplay !== false,
        loop: slot?.loop !== false,
        muted: slot?.muted !== false,
      }))
    },

    add() {
      this.form.push({
        name: '',
        target: '',
        orientation: 'any',
        autoplay: true,
        loop: true,
        muted: true,
      })
    },

    remove(index: number) {
      this.form.splice(index, 1)
    },

    submit() {
      const slots = this.form.map(slot => ({
        name: this.normalizeName(slot.name),
        target: String(slot.target ?? '').trim() || undefined,
        orientation: ['horizontal', 'vertical', 'any'].includes(String(slot.orientation))
          ? slot.orientation
          : 'any',
        autoplay: slot.autoplay !== false,
        loop: slot.loop !== false,
        muted: slot.muted !== false,
      }))

      const names = slots.map(slot => slot.name)
      if (names.some(name => !name)) {
        this.errorMessage = String(this.$t('categoryLibrary.mediaSlots.nameRequired'))
        return
      }

      if (new Set(names).size !== names.length) {
        this.errorMessage = String(this.$t('categoryLibrary.mediaSlots.nameDuplicate'))
        return
      }

      this.$emit('save', slots)
    },
  },
}
</script>

<style scoped>
.media-slot {
  border: 1px solid rgba(var(--v-theme-on-surface), .12);
  border-radius: 8px;
  background: rgba(0, 0, 0, .12);
}
</style>

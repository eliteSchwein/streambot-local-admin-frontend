<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center">
          <v-icon icon="mdi-file-plus-outline" class="mr-2" />
          {{ $t('overlay.customization.createStyleTitle') }}
        </v-toolbar-title>

        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-text-field
          ref="fileNameInput"
          v-model="fileName"
          :label="$t('overlay.customization.newStyleFilePrompt')"
          :hint="$t('overlay.customization.createStyleHint')"
          persistent-hint
          autofocus
          density="compact"
          variant="outlined"
          :error-messages="fieldErrorMessages"
          :loading="nameChecking"
          @keyup.enter="submit"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          :disabled="!canSubmit || nameChecking || nameExists"
          :loading="submitting"
          @click="submit"
        >
          <v-icon icon="mdi-plus" class="mr-2" />
          {{ $t('overlay.customization.createStyle') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { checkNameExists } from '@/helper/NameExistsHelper'

export default {
  name: 'CreateCustomStyleDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'create'],

  data() {
    return {
      fileName: 'custom.scss',
      errorMessage: '',
      nameChecking: false,
      nameExists: false,
      submitting: false,
      nameCheckTimer: null as ReturnType<typeof setTimeout> | null,
      nameCheckToken: 0,
    }
  },

  computed: {
    normalizedFileName(): string {
      return String(this.fileName ?? '').trim()
    },

    canSubmit(): boolean {
      return /\.(css|scss)$/i.test(this.normalizedFileName)
    },

    fieldErrorMessages(): string[] {
      if (this.errorMessage) return [this.errorMessage]
      if (this.nameExists) {
        return [String(this.$t('overlay.customization.createStyleAlreadyExists'))]
      }
      return []
    },
  },

  watch: {
    modelValue(value: boolean) {
      if (!value) return

      this.fileName = 'custom.scss'
      this.errorMessage = ''
      this.nameExists = false
      this.nameChecking = false
      this.submitting = false
      this.nameCheckToken += 1
      if (this.nameCheckTimer) {
        clearTimeout(this.nameCheckTimer)
        this.nameCheckTimer = null
      }

      // Check the default filename immediately when the dialog opens.
      this.scheduleNameCheck(0)

      this.$nextTick(() => {
        const input = (this.$refs.fileNameInput as any)?.$el?.querySelector?.('input') as HTMLInputElement | undefined
        input?.select?.()
      })
    },

    fileName() {
      this.errorMessage = ''
      this.scheduleNameCheck()
    },
  },

  beforeUnmount() {
    if (this.nameCheckTimer) clearTimeout(this.nameCheckTimer)
  },

  methods: {
    scheduleNameCheck(delay = 300) {
      if (this.nameCheckTimer) clearTimeout(this.nameCheckTimer)

      const fileName = this.normalizedFileName
      this.nameExists = false

      if (!fileName || !/\.(css|scss)$/i.test(fileName)) {
        this.nameChecking = false
        return
      }

      const token = ++this.nameCheckToken
      this.nameChecking = true

      this.nameCheckTimer = setTimeout(async () => {
        try {
          const exists = await checkNameExists('overlay_custom_style_exists', fileName)
          if (token === this.nameCheckToken && fileName === this.normalizedFileName) {
            this.nameExists = exists
          }
        } catch {
          if (token === this.nameCheckToken) this.nameExists = false
        } finally {
          if (token === this.nameCheckToken) this.nameChecking = false
        }
      }, delay)
    },

    async ensureNameAvailable(): Promise<boolean> {
      const fileName = this.normalizedFileName
      if (!fileName || !/\.(css|scss)$/i.test(fileName)) return false

      this.nameChecking = true
      try {
        this.nameExists = await checkNameExists('overlay_custom_style_exists', fileName)
        return !this.nameExists
      } finally {
        this.nameChecking = false
      }
    },

    async submit() {
      const fileName = this.normalizedFileName

      if (!fileName) {
        this.errorMessage = String(this.$t('overlay.customization.createStyleNameRequired'))
        return
      }

      if (!/\.(css|scss)$/i.test(fileName)) {
        this.errorMessage = String(this.$t('overlay.customization.createStyleInvalidExtension'))
        return
      }

      this.submitting = true

      try {
        if (!(await this.ensureNameAvailable())) return
        this.$emit('create', fileName)
      } catch (error: any) {
        this.errorMessage = error?.message ?? String(error ?? '')
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

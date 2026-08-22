<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    @update:model-value="handleModelValueUpdate"
  >
    <v-card color="grey-darken-4" class="overlay-customization-dialog">
      <v-toolbar flat density="compact">
        <v-toolbar-title class="d-flex align-center">
          <v-icon icon="mdi-palette-outline" class="mr-2" />
          {{ $t('overlay.customization.title') }}
        </v-toolbar-title>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-content-save"
          :loading="saving"
          :disabled="loading"
          @click="saveStyle"
        >
          {{ $t('common.save') }}
        </v-btn>

        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-toolbar>

      <v-tabs v-model="tab" bg-color="grey-darken-3">
        <v-tab value="style">
          <v-icon icon="mdi-language-css3" class="mr-2" />
          {{ $t('overlay.customization.customCss') }}
        </v-tab>
        <v-tab value="fonts">
          <v-icon icon="mdi-format-font" class="mr-2" />
          {{ $t('overlay.customization.fonts') }}
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-0 overlay-customization-dialog__body">
        <v-alert
          v-if="errorMessage"
          type="error"
          color="red-darken-3"
          density="compact"
          closable
          class="ma-3 mb-0"
          :text="errorMessage"
          @click:close="errorMessage = ''"
        />

        <v-alert
          v-if="successMessage"
          type="success"
          density="compact"
          closable
          class="ma-3 mb-0"
          :text="successMessage"
          @click:close="successMessage = ''"
        />

        <v-window v-model="tab" class="overlay-customization-dialog__window">
          <v-window-item value="style" class="overlay-customization-dialog__window-item">
            <div class="overlay-customization-dialog__style-toolbar">
              <v-btn
                variant="text"
                prepend-icon="mdi-download"
                :href="customCssDownloadUrl"
                target="_blank"
              >
                {{ $t('overlay.customization.downloadCustomCss') }}
              </v-btn>

              <div class="text-caption text-grey-lighten-1 ml-3">
                {{ $t('overlay.customization.scssSupportNote') }}
              </div>
            </div>

            <div class="overlay-customization-dialog__editor">
              <vue-monaco-editor
                v-model:value="content"
                language="scss"
                theme="vs-dark"
                height="100%"
                :options="editorOptions"
              />
            </div>
          </v-window-item>

          <v-window-item value="fonts" class="overlay-customization-dialog__window-item">
            <div class="overlay-customization-dialog__fonts pa-4">
              <v-card color="grey-darken-3" variant="flat" class="mb-4">
                <v-card-title class="text-subtitle-1">
                  {{ $t('overlay.customization.uploadFonts') }}
                </v-card-title>
                <v-card-text>
                  <v-file-input
                    v-model="fontUploadFiles"
                    multiple
                    chips
                    clearable
                    accept=".ttf,.otf,.woff,.woff2,.eot,.zip,font/ttf,font/otf,font/woff,font/woff2,application/zip"
                    prepend-icon="mdi-format-font"
                    :label="$t('overlay.customization.fontFiles')"
                    :hint="$t('overlay.customization.fontUploadHint')"
                    persistent-hint
                    :disabled="uploading"
                  />

                  <div class="d-flex justify-end mt-3">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-upload"
                      :loading="uploading"
                      :disabled="!fontUploadFiles.length"
                      @click="uploadFonts"
                    >
                      {{ $t('media.upload') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <v-card color="grey-darken-3" variant="flat">
                <v-card-title class="d-flex align-center justify-space-between">
                  <span class="text-subtitle-1">
                    {{ $t('overlay.customization.installedFonts') }}
                  </span>
                  <v-btn
                    icon="mdi-refresh"
                    variant="text"
                    size="small"
                    :loading="loadingFonts"
                    @click="loadFonts"
                  />
                </v-card-title>

                <v-divider />

                <v-table density="compact" class="overlay-customization-dialog__font-table">
                  <thead>
                  <tr>
                    <th>{{ $t('overlay.customization.family') }}</th>
                    <th>{{ $t('file.name') }}</th>
                    <th>{{ $t('overlay.customization.weight') }}</th>
                    <th>{{ $t('overlay.customization.style') }}</th>
                    <th>{{ $t('overlay.customization.cssClass') }}</th>
                    <th class="text-right">{{ $t('yolobox.settings.actions') }}</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="font in fonts" :key="font.path">
                    <td>
                        <span :style="{ fontFamily: `'${font.family}', sans-serif` }">
                          {{ font.family }}
                        </span>
                    </td>
                    <td>
                      <div>{{ font.name }}</div>
                      <div class="text-caption text-grey-lighten-1">{{ font.path }}</div>
                    </td>
                    <td>{{ font.weight }}</td>
                    <td>{{ font.style }}</td>
                    <td>
                      <v-chip size="small" variant="tonal" @click="copyText(`.${font.className}`)">
                        .{{ font.className }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="small"
                        :loading="deletingFont === font.path"
                        @click="deleteFont(font)"
                      />
                    </td>
                  </tr>

                  <tr v-if="!fonts.length && !loadingFonts">
                    <td colspan="6" class="text-center text-grey-lighten-1 py-8">
                      {{ $t('overlay.customization.noFonts') }}
                    </td>
                  </tr>
                  </tbody>
                </v-table>
              </v-card>

              <v-card color="grey-darken-3" variant="flat" class="mt-4">
                <v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
                  <span>{{ $t('overlay.customization.generatedFontCss') }}</span>
                  <div class="d-flex align-center">
                    <v-btn
                      variant="text"
                      size="small"
                      prepend-icon="mdi-download"
                      :href="fontCssDownloadUrl"
                      target="_blank"
                    >
                      {{ $t('overlay.customization.downloadFontCss') }}
                    </v-btn>

                    <v-btn
                      variant="text"
                      size="small"
                      prepend-icon="mdi-content-copy"
                      @click="copyText(generatedFontCss)"
                    >
                      {{ $t('media.copy') }}
                    </v-btn>
                  </div>
                </v-card-title>
                <v-divider />
                <pre class="overlay-customization-dialog__generated-css">{{ generatedFontCss || '/* No fonts installed */' }}</pre>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {mapState} from 'pinia'
import {useAppStore} from '@/stores/app'
import {VueMonacoEditor} from '@guolao/vue-monaco-editor'

type FontEntry = {
  name: string
  path: string
  url: string
  family: string
  className: string
  weight: number
  style: string
  size: number
  modified: string
}

export default {
  name: 'OverlayCustomizationDialog',

  components: {
    VueMonacoEditor,
  },

  props: {
    modelValue: {type: Boolean, default: false},
  },

  emits: ['update:modelValue'],

  data() {
    return {
      tab: 'style',
      content: '',
      loading: false,
      saving: false,
      uploading: false,
      loadingFonts: false,
      deletingFont: '',
      errorMessage: '',
      successMessage: '',
      fontUploadFiles: [] as File[],
      fonts: [] as FontEntry[],
      generatedFontCss: '',
    }
  },

  computed: {
    ...mapState(useAppStore, ['getRestApi']),

    apiBase(): string {
      return String(this.getRestApi || '').replace(/\/+$/, '')
    },

    customCssDownloadUrl(): string {
      return `${this.apiBase}/overlay/custom-style/download`
    },

    fontCssDownloadUrl(): string {
      return `${this.apiBase}/overlay/fonts/download`
    },

    editorOptions(): any {
      return {
        automaticLayout: true,
        minimap: {enabled: false},
        fontSize: 14,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        bracketPairColorization: {enabled: true},
        readOnly: this.loading || this.saving,
      }
    },
  },

  methods: {
    async handleModelValueUpdate(value: boolean) {
      this.$emit('update:modelValue', value)

      if (value) {
        await this.loadAll()
      }
    },

    async loadAll() {
      await Promise.all([
        this.loadStyle(),
        this.loadFonts(),
      ])
    },

    async requestJson(url: string, options: RequestInit = {}) {
      const response = await fetch(`${this.apiBase}${url}`, options)
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.error) {
        throw new Error(data?.error || `request failed with ${response.status}`)
      }

      return data
    },

    async loadStyle() {
      this.loading = true
      this.errorMessage = ''

      try {
        const data = await this.requestJson('/overlay/custom-style')
        this.content = String(data?.content ?? '')
        this.fonts = Array.isArray(data?.fonts) ? data.fonts : this.fonts
        this.generatedFontCss = String(data?.generated_font_css ?? this.generatedFontCss)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'loading custom style failed'
      } finally {
        this.loading = false
      }
    },

    async saveStyle() {
      this.saving = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const data = await this.requestJson('/overlay/custom-style', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            mode: 'scss',
            content: this.content,
          }),
        })

        this.generatedFontCss = String(data?.generated_font_css ?? this.generatedFontCss)
        this.successMessage = this.$t('overlay.customization.saved') as string
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'saving custom style failed'
      } finally {
        this.saving = false
      }
    },

    async loadFonts() {
      this.loadingFonts = true

      try {
        const data = await this.requestJson('/overlay/fonts')
        this.fonts = Array.isArray(data?.files) ? data.files : []
        this.generatedFontCss = String(data?.generated_css ?? '')
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'loading fonts failed'
      } finally {
        this.loadingFonts = false
      }
    },

    async uploadFonts() {
      if (!this.fontUploadFiles.length) return

      this.uploading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        for (const file of this.fontUploadFiles) {
          const response = await fetch(`${this.apiBase}/overlay/fonts/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'X-File-Name': encodeURIComponent(file.name),
            },
            body: file,
          })

          const data = await response.json().catch(() => ({}))
          if (!response.ok || data?.error) {
            throw new Error(data?.error || `upload failed with ${response.status}`)
          }

          this.fonts = Array.isArray(data?.files) ? data.files : this.fonts
          this.generatedFontCss = String(data?.generated_css ?? this.generatedFontCss)
        }

        this.fontUploadFiles = []
        this.successMessage = this.$t('overlay.customization.fontsUploaded') as string
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'font upload failed'
      } finally {
        this.uploading = false
      }
    },

    async deleteFont(font: FontEntry) {
      this.deletingFont = font.path
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const data = await this.requestJson('/overlay/fonts/delete', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({path: font.path}),
        })

        this.fonts = Array.isArray(data?.files) ? data.files : []
        this.generatedFontCss = String(data?.generated_css ?? '')
        this.successMessage = this.$t('overlay.customization.fontDeleted') as string
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'deleting font failed'
      } finally {
        this.deletingFont = ''
      }
    },

    async copyText(value: string) {
      if (!value) return

      try {
        await navigator.clipboard.writeText(value)
      } catch (error) {
        console.error('copy failed', error)
      }
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      async handler(value: boolean) {
        if (value) await this.loadAll()
      },
    },
  },
}
</script>

<style scoped>
.overlay-customization-dialog {
  height: 100vh;
}

.overlay-customization-dialog__body {
  height: calc(100vh - 96px);
  overflow: hidden;
}

.overlay-customization-dialog__window,
.overlay-customization-dialog__window-item {
  height: 100%;
}

.overlay-customization-dialog__style-toolbar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgb(var(--v-theme-surface));
}

.overlay-customization-dialog__editor {
  height: calc(100% - 56px);
  background: #1e1e1e;
}

.overlay-customization-dialog__fonts {
  height: 100%;
  overflow: auto;
}

.overlay-customization-dialog__font-table {
  background: transparent;
}

.overlay-customization-dialog__generated-css {
  margin: 0;
  padding: 16px;
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;
  background: #1e1e1e;
  font-family: monospace;
  font-size: 12px;
}
</style>

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
                @click="downloadCustomCss"
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

                <div class="overlay-customization-dialog__font-list">
                  <div
                    v-if="fontFamilies.length"
                    class="overlay-customization-dialog__font-list-header"
                  >
                    <div>{{ $t('overlay.customization.family') }}</div>
                    <div>{{ $t('overlay.customization.cssClass') }}</div>
                    <div>{{ $t('overlay.customization.weight') }}</div>
                  </div>

                  <template v-for="family in fontFamilies" :key="family.family">
                    <v-expansion-panels
                      v-if="family.fonts.length > 1 || family.variable"
                      variant="accordion"
                      class="overlay-customization-dialog__font-family"
                    >
                      <v-expansion-panel>
                        <v-expansion-panel-title>
                          <div class="overlay-customization-dialog__font-family-row">
                            <div>
                              <span :style="{ fontFamily: `'${family.family}', sans-serif` }">
                                {{ family.family }}
                              </span>
                              <v-chip
                                v-if="family.variable"
                                size="x-small"
                                variant="tonal"
                                class="ml-2"
                              >
                                Variable
                              </v-chip>
                              <span class="text-caption text-grey-lighten-1 ml-2">
                                {{ family.fonts.length }} file{{ family.fonts.length === 1 ? '' : 's' }}
                              </span>
                            </div>

                            <div>
                              <v-chip
                                size="small"
                                variant="tonal"
                                @click.stop="copyText(`.${family.className}`)"
                              >
                                .{{ family.className }}
                              </v-chip>
                            </div>

                            <div>
                              {{ family.weightMin === family.weightMax
                                ? family.weightMin
                                : `${family.weightMin}–${family.weightMax}` }}
                            </div>
                          </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <v-table density="compact" class="overlay-customization-dialog__font-table">
                            <thead>
                            <tr>
                              <th>{{ $t('file.name') }}</th>
                              <th>{{ $t('overlay.customization.weight') }}</th>
                              <th>{{ $t('overlay.customization.style') }}</th>
                              <th>Axes</th>
                              <th class="text-right">{{ $t('yolobox.settings.actions') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="font in family.fonts" :key="font.path">
                              <td>
                                <div>{{ font.name }}</div>
                                <div class="text-caption text-grey-lighten-1">{{ font.path }}</div>
                              </td>
                              <td>
                                {{ font.variable && font.weightMin !== font.weightMax
                                  ? `${font.weightMin}–${font.weightMax}`
                                  : font.weight }}
                              </td>
                              <td>{{ font.style }}</td>
                              <td>
                                <div v-if="font.axes?.length" class="d-flex flex-wrap ga-1">
                                  <v-chip
                                    v-for="axis in font.axes"
                                    :key="axis.tag"
                                    size="x-small"
                                    variant="outlined"
                                  >
                                    {{ axis.tag }} {{ axis.min }}–{{ axis.max }}
                                  </v-chip>
                                </div>
                                <span v-else class="text-grey-lighten-1">—</span>
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
                            </tbody>
                          </v-table>

                          <div v-if="family.variable" class="mt-3">
                            <div class="text-caption text-grey-lighten-1 mb-2">
                              Generated weight variants
                            </div>
                            <div class="d-flex flex-wrap ga-2">
                              <v-chip
                                v-for="variant in family.generatedVariants"
                                :key="variant.className"
                                size="small"
                                variant="tonal"
                                @click="copyText(`.${variant.className}`)"
                              >
                                .{{ variant.className }} · {{ variant.weight }}
                              </v-chip>
                            </div>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>

                    <div v-else class="overlay-customization-dialog__font-family-row overlay-customization-dialog__font-family-row--single">
                      <div>
                        <span :style="{ fontFamily: `'${family.family}', sans-serif` }">
                          {{ family.family }}
                        </span>
                        <div class="text-caption text-grey-lighten-1">
                          {{ family.fonts[0].name }}
                        </div>
                      </div>

                      <div>
                        <v-chip
                          size="small"
                          variant="tonal"
                          @click="copyText(`.${family.className}`)"
                        >
                          .{{ family.className }}
                        </v-chip>
                      </div>

                      <div class="d-flex align-center justify-space-between">
                        <span>{{ family.fonts[0].weight }}</span>
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          color="error"
                          size="small"
                          :loading="deletingFont === family.fonts[0].path"
                          @click="deleteFont(family.fonts[0])"
                        />
                      </div>
                    </div>
                  </template>

                  <div
                    v-if="!fontFamilies.length && !loadingFonts"
                    class="text-center text-grey-lighten-1 py-8"
                  >
                    {{ $t('overlay.customization.noFonts') }}
                  </div>
                </div>
              </v-card>

              <v-card color="grey-darken-3" variant="flat" class="mt-4">
                <v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
                  <span>{{ $t('overlay.customization.generatedFontCss') }}</span>
                  <div class="d-flex align-center">
                    <v-btn
                      variant="text"
                      size="small"
                      prepend-icon="mdi-download"
                      @click="downloadFontCss"
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
import {getWebsocketClient} from '@/plugins/websocketInstance'
import {useAppStore} from '@/stores/app'
import {VueMonacoEditor} from '@guolao/vue-monaco-editor'

type FontEntry = {
  name: string
  path: string
  url: string
  family: string
  className: string
  weight: number
  weightMin: number
  weightMax: number
  style: string
  variable: boolean
  axes: {
    tag: string
    min: number
    default: number
    max: number
  }[]
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


    fontFamilies() {
      const weightVariants = [
        {weight: 100, className: 'font-thin'},
        {weight: 200, className: 'font-extra-light'},
        {weight: 300, className: 'font-light'},
        {weight: 400, className: 'font-normal'},
        {weight: 500, className: 'font-medium'},
        {weight: 600, className: 'font-semi-bold'},
        {weight: 700, className: 'font-bold'},
        {weight: 800, className: 'font-extra-bold'},
        {weight: 900, className: 'font-black'},
      ]

      const grouped = new Map<string, FontEntry[]>()

      for (const font of this.fonts) {
        const familyFonts = grouped.get(font.family) ?? []
        familyFonts.push(font)
        grouped.set(font.family, familyFonts)
      }

      return Array.from(grouped.entries()).map(([family, fonts]) => {
        const variable = fonts.some(font => font.variable)
        const weightMin = Math.min(...fonts.map(font => font.weightMin ?? font.weight))
        const weightMax = Math.max(...fonts.map(font => font.weightMax ?? font.weight))

        return {
          family,
          className: fonts[0].className,
          fonts,
          variable,
          weightMin,
          weightMax,
          generatedVariants: variable
            ? weightVariants.filter(variant =>
                variant.weight >= weightMin && variant.weight <= weightMax
              )
            : [],
        }
      })
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

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 15_000): Promise<any> {
      const websocketClient = getWebsocketClient()

      if (!websocketClient) {
        throw new Error('websocket is not connected')
      }

      const response = await websocketClient.request(method, params, timeout)
      let data = response?.params ?? response

      // Some BaseApi responses are wrapped as { data, status }.
      if (data?.data !== undefined) {
        data = data.data
      }

      if (data?.error) {
        throw new Error(data?.message ?? data.error)
      }

      return data
    },

    downloadContent(payload: any) {
      const data = payload?.data ?? payload

      if (data?.content === undefined || data?.content === null) {
        throw new Error('download content missing')
      }

      const blob = new Blob([String(data.content)], {
        type: String(data.type ?? 'text/plain'),
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = String(data.filename ?? 'download.txt')
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },

    async loadStyle() {
      this.loading = true
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_get')
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
        const data = await this.requestWebsocket('overlay_custom_style_save', {
          mode: 'scss',
          content: this.content,
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
        const data = await this.requestWebsocket('overlay_fonts_list')
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
        const formData = new FormData()

        for (const file of this.fontUploadFiles) {
          formData.append('files', file, file.name)
        }

        const response = await fetch(`${this.apiBase}/api/overlay/fonts/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok || data?.error) {
          throw new Error(data?.message || data?.error || `upload failed with ${response.status}`)
        }

        this.fonts = Array.isArray(data?.files) ? data.files : this.fonts
        this.generatedFontCss = String(data?.generated_css ?? this.generatedFontCss)
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
        const data = await this.requestWebsocket('overlay_fonts_delete', {path: font.path})

        this.fonts = Array.isArray(data?.files) ? data.files : []
        this.generatedFontCss = String(data?.generated_css ?? '')
        this.successMessage = this.$t('overlay.customization.fontDeleted') as string
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'deleting font failed'
      } finally {
        this.deletingFont = ''
      }
    },

    async downloadCustomCss() {
      this.errorMessage = ''

      try {
        this.downloadContent(await this.requestWebsocket('overlay_custom_style_download'))
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'custom stylesheet download failed'
      }
    },

    async downloadFontCss() {
      this.errorMessage = ''

      try {
        this.downloadContent(await this.requestWebsocket('overlay_fonts_download'))
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'font stylesheet download failed'
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

.overlay-customization-dialog__font-list {
  width: 100%;
}

.overlay-customization-dialog__font-list-header,
.overlay-customization-dialog__font-family-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(120px, .6fr);
  align-items: center;
  gap: 16px;
}

.overlay-customization-dialog__font-list-header {
  padding: 8px 24px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
}

.overlay-customization-dialog__font-family {
  border-bottom: 1px solid rgba(255, 255, 255, .12);
}

.overlay-customization-dialog__font-family-row {
  width: 100%;
}

.overlay-customization-dialog__font-family-row--single {
  min-height: 52px;
  padding: 8px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
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

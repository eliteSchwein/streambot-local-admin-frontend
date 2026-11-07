<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    @update:model-value="handleModelValueUpdate"
  >
    <v-card color="grey-darken-4" class="overlay-customization-dialog">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center">
          <v-icon icon="mdi-palette-outline" class="mr-2" />
          {{ $t('overlay.customization.title') }}
        </v-toolbar-title>

        <v-btn
          v-if="tab === 'style' && selectedStyle"
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
          {{ $t('overlay.customization.customStyles') }}
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
          density="comfortable"
          closable
          class="ma-3 mb-0"
          :text="errorMessage"
          @click:close="errorMessage = ''"
        />

        <v-snackbar
          v-model="successVisible"
          location="bottom right"
          color="success"
          :timeout="3000"
        >
          <div class="d-flex align-center">
            <v-icon icon="mdi-check-circle" class="mr-2" />
            {{ successMessage }}
          </div>

          <template #actions>
            <v-btn icon="mdi-close" variant="text" size="small" @click="successVisible = false" />
          </template>
        </v-snackbar>

        <v-window v-model="tab" class="overlay-customization-dialog__window">
          <v-window-item value="style" class="overlay-customization-dialog__window-item">
            <div class="overlay-customization-dialog__styles-layout">
              <aside class="overlay-customization-dialog__styles-sidebar">
                <div class="overlay-customization-dialog__styles-sidebar-toolbar">
                  <span class="text-subtitle-2">{{ $t('overlay.customization.styleFiles') }}</span>

                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    size="small"
                    :title="$t('overlay.customization.newStyleFile')"
                    @click="createStyleDialog = true"
                  />
                </div>

                <v-list
                  density="comfortable"
                  bg-color="transparent"
                  class="overlay-customization-dialog__styles-list"
                >
                  <v-list-item
                    v-for="style in styleFiles"
                    :key="style.path"
                    :active="selectedStyle?.path === style.path"
                    @click="selectStyle(style)"
                  >
                    <template #prepend>
                      <v-icon :icon="style.mode === 'scss' ? 'mdi-sass' : 'mdi-language-css3'" />
                    </template>

                    <v-list-item-title>{{ style.name }}</v-list-item-title>

                    <template #append>
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="x-small"
                        @click.stop="deleteStyle(style)"
                      />
                    </template>
                  </v-list-item>
                </v-list>

                <div v-if="!styleFiles.length && !loading" class="text-caption text-grey-lighten-1 pa-4">
                  {{ $t('overlay.customization.noStyleFiles') }}
                </div>
              </aside>

              <section class="overlay-customization-dialog__styles-main">
                <div class="overlay-customization-dialog__style-toolbar">
                  <template v-if="selectedStyle">
                    <strong>{{ selectedStyle.name }}</strong>

                    <v-spacer />

                    <v-btn
                      variant="text"
                      prepend-icon="mdi-download"
                      @click="downloadCurrentStyle"
                    >
                      {{ $t('overlay.customization.downloadSource') }}
                    </v-btn>

                    <v-btn
                      variant="text"
                      prepend-icon="mdi-download"
                      @click="downloadCompiledCss"
                    >
                      {{ $t('overlay.customization.downloadCompiledCss') }}
                    </v-btn>
                  </template>

                  <template v-else>
                    <span class="text-grey-lighten-1">
                      {{ $t('overlay.customization.selectStyleFile') }}
                    </span>
                  </template>
                </div>

                <div v-if="selectedStyle" class="overlay-customization-dialog__editor">
                  <vue-monaco-editor
                    v-model:value="content"
                    :language="selectedStyle.mode"
                    theme="vs-dark"
                    height="100%"
                    :options="editorOptions"
                  />
                </div>
              </section>
            </div>
          </v-window-item>
          <v-window-item value="fonts" class="overlay-customization-dialog__window-item">
            <div class="overlay-customization-dialog__styles-layout">
              <aside class="overlay-customization-dialog__styles-sidebar">
                <div class="overlay-customization-dialog__styles-sidebar-toolbar">
                  <span class="text-subtitle-2">{{ $t('overlay.customization.installedFonts') }}</span>

                  <div class="d-flex align-center">
                    <v-btn
                      icon="mdi-refresh"
                      variant="text"
                      size="small"
                      :loading="loadingFonts"
                      @click="loadFonts"
                    />
                    <v-btn
                      icon="mdi-upload"
                      variant="text"
                      size="small"
                      :loading="uploading"
                      :title="`${$t('overlay.customization.uploadFonts')} – ${$t('overlay.customization.fontUploadHint')}`"
                      @click="openFontUpload"
                    />
                  </div>

                  <input
                    ref="fontUploadInput"
                    type="file"
                    multiple
                    hidden
                    accept=".ttf,.otf,.woff,.woff2,.eot,.zip,font/ttf,font/otf,font/woff,font/woff2,application/zip"
                    @change="handleFontUploadSelection"
                  >
                </div>

                <v-list
                  density="comfortable"
                  bg-color="transparent"
                  class="overlay-customization-dialog__styles-list"
                >
                  <v-list-item
                    v-for="family in fontFamilies"
                    :key="family.family"
                    :active="selectedFontView === family.family"
                    @click="selectedFontView = family.family"
                  >
                    <template #prepend>
                      <v-icon :icon="family.variable ? 'mdi-format-font-size-increase' : 'mdi-format-font'" />
                    </template>

                    <v-list-item-title :style="{ fontFamily: `'${family.family}', sans-serif` }">
                      {{ family.family }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ $t('overlay.customization.fileCount', { count: family.fonts.length }, family.fonts.length) }}
                      · {{ formatWeightRange(family.weightMin, family.weightMax) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <div v-if="!fontFamilies.length && !loadingFonts" class="text-caption text-grey-lighten-1 pa-4">
                  {{ $t('overlay.customization.noFonts') }}
                </div>
              </aside>

              <section class="overlay-customization-dialog__styles-main">
                <div class="overlay-customization-dialog__style-toolbar">
                  <template v-if="selectedFontFamily">
                    <strong>{{ selectedFontFamily.family }}</strong>

                    <v-chip
                      v-if="selectedFontFamily.variable"
                      size="small"
                      variant="tonal"
                      class="ml-2"
                    >
                      {{ $t('overlay.customization.variableFont') }}
                    </v-chip>
                  </template>

                  <span v-else class="text-grey-lighten-1">
                    {{ $t('overlay.customization.selectFont') }}
                  </span>
                </div>


                <div v-if="selectedFontFamily" class="overlay-customization-dialog__font-detail pa-4">
                  <v-card color="grey-darken-3" variant="flat" class="mb-4">
                    <v-card-title class="text-subtitle-2">
                      {{ $t('overlay.customization.classGenerator') }}
                    </v-card-title>
                    <v-card-text>
                      <v-row density="comfortable">
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="fontClassWeight"
                            :items="selectedFontWeightOptions"
                            :label="$t('overlay.customization.weight')"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                          />
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field
                            :model-value="generatedFontClasses"
                            :label="$t('overlay.customization.cssClasses')"
                            readonly
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            class="font-monospace"
                            @focus="selectFieldText"
                          />
                        </v-col>
                      </v-row>

                      <div
                        class="overlay-customization-dialog__font-preview mt-4"
                        :style="{ fontFamily: `'${selectedFontFamily.family}', sans-serif`, fontWeight: fontClassWeight || undefined }"
                      >
                        {{ $t('overlay.customization.previewText') }}
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-card color="grey-darken-3" variant="flat" class="mb-4">
                    <v-card-text>
                      <div
                        v-for="variant in selectedFontPreviewWeights"
                        :key="variant"
                        class="overlay-customization-dialog__font-preview"
                        :style="{ fontFamily: `'${selectedFontFamily.family}', sans-serif`, fontWeight: variant }"
                      >
                        <span class="text-caption text-grey-lighten-1 overlay-customization-dialog__font-preview-weight">
                          {{ variant }}
                        </span>
                        {{ $t('overlay.customization.previewText') }}
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-card color="grey-darken-3" variant="flat">
                    <v-table density="comfortable" class="overlay-customization-dialog__font-table">
                      <thead>
                      <tr>
                        <th>{{ $t('file.name') }}</th>
                        <th>{{ $t('overlay.customization.weight') }}</th>
                        <th>{{ $t('overlay.customization.style') }}</th>
                        <th>{{ $t('overlay.customization.axes') }}</th>
                        <th class="text-right">{{ $t('yolobox.settings.actions') }}</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="font in selectedFontFamily.fonts" :key="font.path">
                        <td>
                          <div>{{ font.name }}</div>
                          <div class="text-caption text-grey-lighten-1">{{ font.path }}</div>
                        </td>
                        <td>
                          {{ font.variable
                            ? formatWeightRange(font.weightMin ?? font.weight, font.weightMax ?? font.weight)
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
                  </v-card>

                </div>
              </section>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <CreateCustomStyleDialog
      v-model="createStyleDialog"
      @create="createStyle"
    />
  </v-dialog>
</template>

<script lang="ts">
// Must match the weight classes generated by the backend (getGeneratedFontCss).
const fontWeightClasses = [
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

import {mapState} from 'pinia'
import CreateCustomStyleDialog from '@/components/dialogs/CreateCustomStyleDialog.vue'
import {getWebsocketClient} from '@/plugins/websocketInstance'
import {useAppStore} from '@/stores/app'
import {VueMonacoEditor} from '@guolao/vue-monaco-editor'


type CustomStyleEntry = {
  name: string
  path: string
  mode: 'css' | 'scss'
  size: number
  modified: string
}

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
    CreateCustomStyleDialog,
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
      successVisible: false,
      fontUploadFiles: [] as File[],
      selectedFontView: '',
      fontClassWeight: 0,
      fonts: [] as FontEntry[],
      styleFiles: [] as CustomStyleEntry[],
      selectedStyle: null as CustomStyleEntry | null,
      createStyleDialog: false,
    }
  },

  computed: {
    ...mapState(useAppStore, ['getRestApi']),

    apiBase(): string {
      return String(this.getRestApi || '').replace(/\/+$/, '')
    },

    fontFamilies() {
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
            ? fontWeightClasses.filter(variant =>
                variant.weight >= weightMin && variant.weight <= weightMax
              )
            : [],
        }
      })
    },

    selectedFontFamily(): any {
      return (this.fontFamilies as any[]).find(family => family.family === this.selectedFontView) ?? null
    },

    selectedFontWeightOptions(): { title: string, value: number }[] {
      const family = this.selectedFontFamily as any
      if (!family) return []

      const available = family.variable
        ? family.generatedVariants
        : fontWeightClasses.filter(variant => family.fonts.some((font: FontEntry) => font.weight === variant.weight))

      return [
        {title: this.$t('overlay.customization.defaultWeight') as string, value: 0},
        ...available.map((variant: any) => ({title: `${variant.weight} – ${variant.className}`, value: variant.weight})),
      ]
    },

    generatedFontClasses(): string {
      const family = this.selectedFontFamily as any
      if (!family) return ''

      const weightClass = fontWeightClasses.find(variant => variant.weight === this.fontClassWeight)?.className
      return [family.className, weightClass].filter(Boolean).join(' ')
    },

    selectedFontPreviewWeights(): number[] {
      const family = this.selectedFontFamily as any
      if (!family) return []

      if (family.variable) {
        return family.generatedVariants.length
          ? family.generatedVariants.map((variant: any) => variant.weight)
          : [family.weightMin]
      }

      return Array.from(new Set<number>(family.fonts.map((font: FontEntry) => font.weight))).sort((a, b) => a - b)
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
    formatWeightRange(min: number, max: number) {
      return min === max ? String(min) : `${min}–${max}`
    },

    openFontUpload() {
      (this.$refs.fontUploadInput as HTMLInputElement | undefined)?.click()
    },

    async handleFontUploadSelection(event: Event) {
      const input = event.target as HTMLInputElement
      this.fontUploadFiles = Array.from(input.files ?? [])
      input.value = ''
      await this.uploadFonts()
    },

    showSuccess(message: string) {
      this.successMessage = message
      this.successVisible = true
    },

    async handleModelValueUpdate(value: boolean) {
      this.$emit('update:modelValue', value)

      if (value) {
        await this.loadAll()
      }
    },

    async loadAll() {
      await Promise.all([
        this.loadStyles(),
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

    async loadStyles() {
      this.loading = true
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_list')
        this.styleFiles = Array.isArray(data?.files) ? data.files : []
        this.fonts = Array.isArray(data?.fonts) ? data.fonts : this.fonts

        if (!this.styleFiles.length) {
          this.selectedStyle = null
          this.content = ''
          return
        }

        const current = this.selectedStyle
          ? this.styleFiles.find((style: CustomStyleEntry) => style.path === this.selectedStyle?.path)
          : null

        await this.selectStyle(current ?? this.styleFiles[0])
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'loading custom styles failed'
      } finally {
        this.loading = false
      }
    },

    async selectStyle(style: CustomStyleEntry) {
      this.loading = true
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_get', {path: style.path})
        this.selectedStyle = data?.file ?? style
        this.content = String(data?.content ?? '')
        this.styleFiles = Array.isArray(data?.files) ? data.files : this.styleFiles
        this.fonts = Array.isArray(data?.fonts) ? data.fonts : this.fonts
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'loading custom style failed'
      } finally {
        this.loading = false
      }
    },

    async createStyle(fileName: string) {
      const normalizedFileName = String(fileName ?? '').trim()
      if (!normalizedFileName) return

      this.saving = true
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_save', {
          path: normalizedFileName,
          content: '',
        })

        this.styleFiles = Array.isArray(data?.files) ? data.files : this.styleFiles
        const created = data?.file ?? this.styleFiles.find(
          (style: CustomStyleEntry) => style.path === normalizedFileName,
        )

        this.createStyleDialog = false

        if (created) {
          await this.selectStyle(created)
        }

        this.showSuccess(this.$t('overlay.customization.styleCreated') as string)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'creating custom style failed'
      } finally {
        this.saving = false
      }
    },

    async saveStyle() {
      if (!this.selectedStyle) return

      this.saving = true
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_save', {
          path: this.selectedStyle.path,
          content: this.content,
        })

        this.styleFiles = Array.isArray(data?.files) ? data.files : this.styleFiles
        this.selectedStyle = data?.file ?? this.selectedStyle
        this.showSuccess(this.$t('overlay.customization.saved') as string)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'saving custom style failed'
      } finally {
        this.saving = false
      }
    },

    async deleteStyle(style: CustomStyleEntry) {
      if (!window.confirm(
        this.$t('overlay.customization.deleteStyleConfirm', {name: style.name}) as string,
      )) return

      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_custom_style_delete', {path: style.path})
        this.styleFiles = Array.isArray(data?.files) ? data.files : []

        if (this.selectedStyle?.path === style.path) {
          this.selectedStyle = null
          this.content = ''

          if (this.styleFiles.length) {
            await this.selectStyle(this.styleFiles[0])
          }
        }

        this.showSuccess(this.$t('overlay.customization.styleDeleted') as string)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'deleting custom style failed'
      }
    },

    async downloadCurrentStyle() {
      if (!this.selectedStyle) return

      this.errorMessage = ''

      try {
        this.downloadContent(await this.requestWebsocket(
          'overlay_custom_style_download',
          {path: this.selectedStyle.path},
        ))
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'custom stylesheet download failed'
      }
    },

    async downloadCompiledCss() {
      this.errorMessage = ''

      try {
        this.downloadContent(await this.requestWebsocket('overlay_custom_style_download_compiled'))
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'compiled stylesheet download failed'
      }
    },

    async loadFonts() {
      this.loadingFonts = true

      try {
        const data = await this.requestWebsocket('overlay_fonts_list')
        this.fonts = Array.isArray(data?.files) ? data.files : []
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
        this.fontUploadFiles = []
        this.showSuccess(this.$t('overlay.customization.fontsUploaded') as string)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'font upload failed'
      } finally {
        this.uploading = false
      }
    },

    async deleteFont(font: FontEntry) {
      this.deletingFont = font.path
      this.errorMessage = ''

      try {
        const data = await this.requestWebsocket('overlay_fonts_delete', {path: font.path})

        this.fonts = Array.isArray(data?.files) ? data.files : []
        this.showSuccess(this.$t('overlay.customization.fontDeleted') as string)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'deleting font failed'
      } finally {
        this.deletingFont = ''
      }
    },

    selectFieldText(event: FocusEvent) {
      (event.target as HTMLInputElement | null)?.select()
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      async handler(value: boolean) {
        if (value) await this.loadAll()
      },
    },
    selectedFontView() {
      this.fontClassWeight = 0
    },

    fontFamilies(families: any[]) {
      if (!families.some(family => family.family === this.selectedFontView)) this.selectedFontView = families[0]?.family ?? ''
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

.overlay-customization-dialog__styles-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  height: 100%;
}

.overlay-customization-dialog__styles-sidebar {
  min-width: 0;
  overflow: auto;
  border-right: 1px solid rgba(255, 255, 255, .12);
  background: rgb(var(--v-theme-surface));
}

.overlay-customization-dialog__styles-sidebar-toolbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
}

.overlay-customization-dialog__styles-list {
  padding: 0;
}

.overlay-customization-dialog__styles-main {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.overlay-customization-dialog__window :deep(.v-window__container) {
  height: 100%;
}

.overlay-customization-dialog__style-toolbar {
  flex-shrink: 0;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgb(var(--v-theme-surface));
}

.overlay-customization-dialog__editor {
  flex: 1;
  min-height: 0;
  background: #1e1e1e;
}

.overlay-customization-dialog__font-detail {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.overlay-customization-dialog__font-variant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.overlay-customization-dialog__font-table {
  background: transparent;
}

.overlay-customization-dialog__font-preview {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-size: 18px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-customization-dialog__font-preview-weight {
  width: 32px;
  flex-shrink: 0;
  font-family: monospace;
  font-weight: 400;
}
</style>

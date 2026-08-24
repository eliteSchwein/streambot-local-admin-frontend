<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-task-accordion--ffmpeg"
    :item="item"
    :index="index"
    icon="mdi-movie-open-cog-outline"
    :title="$t('macro.ffmpeg.title')"
    export-prefix="macro_media_ffmpeg"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
    @group:selected="onExpansionChange"
  >
    <v-row density="comfortable">
      <v-col cols="12" md="10">
        <v-select
          v-model="selectedTemplate"
          :items="templateOptions"
          :label="$t('macro.ffmpeg.template')"
          prepend-inner-icon="mdi-shape-outline"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          @update:model-value="applyTemplate"
        />
      </v-col>

      <v-col cols="12" md="2" class="d-flex align-center">
        <v-btn
          icon="mdi-information-outline"
          variant="text"
          :title="$t('macro.ffmpeg.argumentsHelp')"
          href="https://ffmpeg.org/ffmpeg.html#Options"
          target="_blank"
          rel="noopener noreferrer"
        />
      </v-col>

      <v-col cols="12">
        <v-combobox
          v-model="task.data.input"
          v-model:menu="inputSuggestionsOpen"
          :items="inputOptions"
          item-title="title"
          item-value="value"
          :loading="loadingSources"
          :label="$t('macro.ffmpeg.input')"
          :placeholder="$t('macro.ffmpeg.inputPlaceholder')"
          :no-data-text="$t('macro.ffmpeg.noInputSuggestions')"
          prepend-inner-icon="mdi-file-import-outline"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
          auto-select-first
          @focus="openInputSuggestions"
          @click="openInputSuggestions"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item?.raw?.icon ?? 'mdi-file-outline'"
              :title="item?.raw?.title ?? String(item?.value ?? '')"
            />
          </template>
        </v-combobox>
      </v-col>

      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-2">{{ $t('macro.ffmpeg.filterInputs') }}</div>

          <v-btn
            icon="mdi-plus"
            size="small"
            variant="text"
            :title="$t('macro.ffmpeg.addFilterInput')"
            @click="addFilterInput"
          />
        </div>

        <v-row
          v-for="(filterInput, filterIndex) in task.data.filter_inputs"
          :key="filterIndex"
          density="comfortable"
          class="mb-1"
        >
          <v-col cols="12" md="6">
            <v-combobox
              v-model="filterInput.path"
              :items="inputOptions"
              item-title="title"
              item-value="value"
              :loading="loadingSources"
              :label="$t('macro.ffmpeg.filterInputFile', { number: filterIndex + 1 })"
              :placeholder="$t('macro.ffmpeg.filterInputFilePlaceholder')"
              prepend-inner-icon="mdi-file-import-outline"
              clearable
              hide-details="auto"
              variant="outlined"
              density="comfortable"
              persistent-placeholder
              auto-select-first
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item?.raw?.icon ?? 'mdi-file-outline'"
                  :title="item?.raw?.title ?? String(item?.value ?? '')"
                />
              </template>
            </v-combobox>
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="filterInput.variable"
              :label="$t('macro.ffmpeg.filterInputVariable')"
              :placeholder="filterVariablePlaceholder(filterIndex)"
              prepend-inner-icon="mdi-variable"
              hide-details="auto"
              variant="outlined"
              density="comfortable"
              persistent-placeholder
            >
              <template #append-inner>
                <span class="text-caption text-medium-emphasis">
                  {{ filterVariablePlaceholder(filterIndex) }}
                </span>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" md="1" class="d-flex align-center justify-end">
            <v-btn
              icon="mdi-minus"
              size="small"
              variant="text"
              :title="$t('macro.ffmpeg.removeFilterInput')"
              @click="removeFilterInput(filterIndex)"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="task.data.arguments"
          :label="$t('macro.ffmpeg.arguments')"
          :placeholder="$t('macro.ffmpeg.argumentsPlaceholder')"
          prepend-inner-icon="mdi-console-line"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-combobox
          v-model="task.data.output_folder"
          :items="folderOptions"
          :disabled="task.data.temporary_file"
          :label="$t('macro.ffmpeg.outputFolder')"
          :placeholder="$t('macro.ffmpeg.outputFolderPlaceholder')"
          prepend-inner-icon="mdi-folder-outline"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="task.data.output_filename"
          :label="$t('macro.ffmpeg.outputFilename')"
          :placeholder="$t('macro.ffmpeg.outputFilenamePlaceholder')"
          prepend-inner-icon="mdi-file-export-outline"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="task.data.temporary_file"
          :label="$t('macro.ffmpeg.temporaryFile')"
          color="primary"
          hide-details="auto"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-combobox
          v-model="task.data.result_variable"
          :items="resultVariableOptions"
          :label="$t('macro.ffmpeg.outputVariable')"
          :placeholder="$t('macro.ffmpeg.outputVariablePlaceholder')"
          prepend-inner-icon="mdi-variable"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          :text="$t('macro.ffmpeg.outputVariableHint')"
        />
      </v-col>

      <v-col cols="12">
        <div class="text-subtitle-2 mb-2">{{ $t('macro.ffmpeg.commandPreview') }}</div>
        <v-sheet
          class="pa-3"
          rounded
          border
        >
          <code style="white-space: pre-wrap; word-break: break-word;">{{ commandPreview }}</code>
        </v-sheet>
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import MacroTaskAccordionTemplate from './MacroTaskAccordionTemplate.vue'

type MediaEntry = {
  name?: string
  path?: string
  type?: 'file' | 'folder' | string
  asset?: string | { original?: string; compressed?: string | null } | null
}

export default {
  name: 'MacroFfmpegTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      appStore: useAppStore(),
      loadingSources: false,
      mediaLoaded: false,
      mediaEntries: [] as MediaEntry[],
      folderEntries: [] as MediaEntry[],
      inputSuggestionsOpen: false,
      selectedTemplate: 'custom',
    }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    templateOptions(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.ffmpeg.templates.custom')), value: 'custom' },
        { title: String(this.$t('macro.ffmpeg.templates.borderWebp')), value: 'border_webp' },
        { title: String(this.$t('macro.ffmpeg.templates.rescale1080p')), value: 'rescale_1080p' },
        { title: String(this.$t('macro.ffmpeg.templates.rescale720p')), value: 'rescale_720p' },
      ]
    },


    commandPreview(): string {
      const quote = (value: any) => {
        const text = String(value ?? '').trim()
        if (!text) return '<empty>'
        if (/^[A-Za-z0-9_./:${}\-]+$/.test(text)) return text
        return `"${text.replace(/"/g, '\\"')}"`
      }

      const input = quote(this.task.data?.input || '${input}')
      const args = String(this.task.data?.arguments ?? '').trim()

      const output = this.task.data?.temporary_file
        ? `/tmp/${String(this.task.data?.output_filename || 'output.webp')}`
        : [
            String(this.task.data?.output_folder ?? '').replace(/^\/+|\/+$/g, ''),
            String(this.task.data?.output_filename || 'output.webp'),
          ].filter(Boolean).join('/')

      return [
        'ffmpeg',
        '-y',
        '-i',
        input,
        ...(args ? [args] : []),
        quote(output || '${output}'),
      ].join(' ')
    },

    variableKeys(): string[] {
      return Object.keys(this.appStore?.getVariables ?? {})
        .map((key) => String(key).trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    },

    inputOptions(): Array<{ title: string; value: string; icon: string }> {
      const media = this.mediaEntries
        .filter((entry) => entry?.type === 'file')
        .map((entry) => {
          const value = this.entryPath(entry)

          return {
            title: value,
            value,
            icon: this.mediaFileIcon(value),
          }
        })
        .filter((entry) => entry.value)

      const variables = this.variableKeys.map((key) => ({
        title: `\${${key}}`,
        value: `\${${key}}`,
        icon: 'mdi-variable',
      }))

      return [...media, ...variables]
    },

    folderOptions(): string[] {
      return this.folderEntries
        .filter((entry) => entry?.type === 'folder')
        .map((entry) => this.normalizePath(entry.path ?? entry.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    },

    resultVariableOptions(): string[] {
      const current = String(this.task.data?.result_variable ?? '').trim()

      return [...new Set([
        ...this.variableKeys,
        ...(current ? [current] : []),
      ])].sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.ensureData()
  },

  methods: {
    ensureData() {
      this.task.channel = 'media'
      this.task.method = 'ffmpeg'
      this.task.data ??= {}
      this.task.data.input ??= ''
      if (!Array.isArray(this.task.data.filter_inputs)) this.task.data.filter_inputs = []
      this.task.data.arguments ??= ''
      this.task.data.output_folder ??= ''
      this.task.data.output_filename ??= 'output.mp4'
      this.task.data.temporary_file ??= false
      this.task.data.result_variable ??= 'ffmpeg_output'
    },

    addFilterInput() {
      if (!Array.isArray(this.task.data.filter_inputs)) {
        this.task.data.filter_inputs = []
      }

      const number = this.task.data.filter_inputs.length + 1

      this.task.data.filter_inputs.push({
        path: '',
        variable: `filter_${number}`,
      })
    },

    removeFilterInput(index: number) {
      if (!Array.isArray(this.task.data.filter_inputs)) return
      this.task.data.filter_inputs.splice(index, 1)
    },

    filterVariablePlaceholder(index: number): string {
      const variable = String(
        this.task.data?.filter_inputs?.[index]?.variable || `filter_${index + 1}`
      ).trim()

      return `\${${variable}}`
    },

    applyTemplate(value: string) {
      switch (value) {
        case 'border_webp':
          this.task.data.arguments = '-i ${border_file} -filter_complex "[1:v][0:v]scale2ref[border][video];[video][border]overlay=0:0:format=auto[outv]" -map "[outv]" -frames:v 1 -c:v libwebp'
          this.task.data.output_filename = 'output.webp'

          if (!Array.isArray(this.task.data.filter_inputs)) {
            this.task.data.filter_inputs = []
          }

          if (this.task.data.filter_inputs.length === 0) {
            this.task.data.filter_inputs.push({
              path: '',
              variable: 'border_file',
            })
          }
          break

        case 'rescale_1080p':
          this.task.data.arguments = '-vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 23 -preset medium -c:a copy'
          this.task.data.output_filename = 'output.mp4'
          break

        case 'rescale_720p':
          this.task.data.arguments = '-vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 23 -preset medium -c:a copy'
          this.task.data.output_filename = 'output.mp4'
          break

        default:
          break
      }
    },

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 15_000): Promise<any> {
      const client = getWebsocketClient()

      if (!client) {
        throw new Error('websocket is not connected')
      }

      const response = await client.request(method, params, timeout)
      return response?.params ?? response
    },

    async onExpansionChange(event: any) {
      const expanded = typeof event === 'boolean' ? event : Boolean(event?.value)

      if (!expanded || this.mediaLoaded || this.loadingSources) return

      await this.fetchMediaEntries()
    },

    async openInputSuggestions() {
      if (!this.mediaLoaded && !this.loadingSources) {
        await this.fetchMediaEntries()
      }

      await this.$nextTick()
      this.inputSuggestionsOpen = true
    },

    async requestMediaList(path: string = ''): Promise<any> {
      try {
        const response = await this.requestWebsocket('media_list', { path })
        return response?.data ?? response
      } catch {
        const response = await fetch(`${this.appStore.getRestApi}/api/assets/media/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        })

        const data = await response.json().catch(() => ({}))
        const responseData = data?.data ?? data

        if (!response.ok || responseData?.error || data?.error) {
          throw new Error(responseData?.error ?? data?.error ?? 'media list failed')
        }

        return responseData
      }
    },

    async fetchMediaEntries(path: string = ''): Promise<MediaEntry[]> {
      if (!path) this.loadingSources = true

      try {
        const data = await this.requestMediaList(path)
        const files = Array.isArray(data?.files) ? data.files : []
        const result: MediaEntry[] = []

        for (const entry of files) {
          result.push(entry)

          if (entry?.type === 'folder' && entry?.path) {
            result.push(...await this.fetchMediaEntries(entry.path))
          }
        }

        if (!path) {
          this.mediaEntries = result
          this.folderEntries = result
          this.mediaLoaded = true
        }

        return result
      } catch {
        if (!path) {
          this.mediaEntries = []
          this.folderEntries = []
          this.mediaLoaded = false
        }

        return []
      } finally {
        if (!path) this.loadingSources = false
      }
    },

    entryPath(entry: MediaEntry): string {
      if (typeof entry.asset === 'object' && entry.asset?.original) {
        return this.normalizePath(entry.asset.original)
      }

      if (typeof entry.asset === 'string') {
        return this.normalizePath(entry.asset)
      }

      return this.normalizePath(entry.path ?? entry.name)
    },

    normalizePath(value: any): string {
      return String(value ?? '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .trim()
    },

    mediaFileIcon(source: string) {
      const extension = String(source ?? '')
        .split(/[?#]/, 1)[0]
        .split('.')
        .pop()
        ?.toLowerCase()

      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(extension ?? '')) {
        return 'mdi-file-image-outline'
      }

      if (['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v'].includes(extension ?? '')) {
        return 'mdi-file-video-outline'
      }

      if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'].includes(extension ?? '')) {
        return 'mdi-file-music-outline'
      }

      return 'mdi-file-outline'
    },
  },
}
</script>

<template>
  <div
    class="file-preview"
    :class="[`file-preview--${variant}`, { 'file-preview--clickable': clickable }]"
    @click="handleClick"
  >
    <v-img
      v-if="isImage"
      :src="previewUrl"
      cover
      class="file-preview__media"
    >
      <template #error>
        <div class="file-preview__placeholder">
          <v-icon icon="mdi-image-broken" size="48" />
        </div>
      </template>
    </v-img>

    <video
      v-else-if="isVideo"
      class="file-preview__media"
      :src="previewUrl"
      :controls="controls"
      :autoplay="autoplay"
      :muted="muted"
      preload="metadata"
    />

    <audio
      v-else-if="isAudio && variant === 'dialog'"
      class="file-preview__audio"
      :src="previewUrl"
      :controls="controls"
      :autoplay="autoplay"
    />

    <div v-else-if="isAudio" class="file-preview__placeholder">
      <v-icon icon="mdi-volume-high" :size="variant === 'dialog' ? 72 : 64" />
      <div v-if="showLabel" class="text-caption mt-2 text-truncate">
        {{ entry?.name || entry?.path }}
      </div>
    </div>

    <iframe
      v-else-if="isHtml && variant === 'dialog'"
      class="file-preview__iframe"
      :src="previewUrl"
    />

    <div
      v-else-if="isJson && variant === 'dialog'"
      class="file-preview__json"
      @click.stop
    >
      <div v-if="jsonLoading" class="file-preview__json-state">
        <v-progress-circular indeterminate size="32" />
      </div>

      <div v-else-if="jsonError" class="file-preview__json-state">
        <v-icon icon="mdi-alert-circle-outline" size="42" />
        <div class="mt-2">{{ jsonError }}</div>
      </div>

      <div v-else class="file-preview__json-tree">
        <div
          v-for="row in jsonRows"
          :key="row.id"
          class="file-preview__json-row"
          :style="{ paddingLeft: `${row.depth * 20 + 12}px` }"
          @click="row.expandable && toggleJsonRow(row.id)"
        >
          <span
            v-if="row.expandable"
            class="file-preview__json-toggle"
          >
            <v-icon
              :icon="row.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              size="18"
            />
          </span>
          <span v-else class="file-preview__json-toggle" />

          <template v-if="row.key !== null">
            <span class="file-preview__json-key">{{ JSON.stringify(row.key) }}</span>
            <span class="file-preview__json-punctuation">: </span>
          </template>

          <span
            v-if="row.type === 'container'"
            class="file-preview__json-punctuation"
          >
            {{ row.open }}
          </span>

          <span
            v-if="row.type === 'container' && !row.expanded"
            class="file-preview__json-summary"
          >
            {{ row.summary }}
          </span>

          <span
            v-if="row.type === 'container' && !row.expanded"
            class="file-preview__json-punctuation"
          >
            {{ row.close }}
          </span>

          <span
            v-else-if="row.type === 'string'"
            class="file-preview__json-string"
          >
            {{ JSON.stringify(row.value) }}
          </span>

          <span
            v-else-if="row.type === 'number'"
            class="file-preview__json-number"
          >
            {{ row.value }}
          </span>

          <span
            v-else-if="row.type === 'boolean'"
            class="file-preview__json-boolean"
          >
            {{ row.value }}
          </span>

          <span
            v-else-if="row.type === 'null'"
            class="file-preview__json-null"
          >
            null
          </span>

          <span
            v-else-if="row.type === 'close'"
            class="file-preview__json-punctuation"
          >
            {{ row.close }}
          </span>

          <span
            v-if="row.comma"
            class="file-preview__json-punctuation"
          >,</span>
        </div>
      </div>
    </div>

    <div v-else class="file-preview__placeholder">
      <v-icon :icon="entryIcon" :size="variant === 'dialog' ? 72 : 56" />
      <div v-if="showLabel" class="text-caption mt-2 text-truncate">
        {{ entry?.name || entry?.path }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
type FileEntry = {
  name?: string
  path?: string
  type?: 'file' | 'folder'
  asset?: {
    compressed?: string | null
  } | string | null
  compressed?: string | null
}

type JsonRow = {
  id: string
  depth: number
  key: string | null
  type: 'container' | 'close' | 'string' | 'number' | 'boolean' | 'null'
  value?: any
  open?: string
  close?: string
  summary?: string
  expandable?: boolean
  expanded?: boolean
  comma?: boolean
}

export default {
  name: 'FilePreview',

  data() {
    return {
      jsonLoading: false,
      jsonError: '',
      jsonData: null as any,
      jsonReady: false,
      jsonExpanded: {} as Record<string, boolean>,
      jsonLoadToken: 0,
    }
  },

  props: {
    entry: {
      type: Object as () => FileEntry | null,
      default: null,
    },
    restApi: {
      type: String,
      required: true,
    },
    publicPrefix: {
      type: String,
      default: '',
    },
    variant: {
      type: String,
      default: 'card',
    },
    controls: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: true,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['click'],

  computed: {
    path(): string {
      return this.normalizePath(this.entry?.path ?? '')
    },

    previewPath(): string {
      return this.getCompressedPath(this.entry) || this.path
    },

    previewUrl(): string {
      return this.getPublicUrl(this.previewPath)
    },

    isImage(): boolean {
      return this.entry?.type === 'file' && /\.(jpe?g|png|webp|gif|svg)$/i.test(this.path)
    },

    isVideo(): boolean {
      return this.entry?.type === 'file' && /\.(mp4|webm|mov|mkv)$/i.test(this.path)
    },

    isAudio(): boolean {
      return this.entry?.type === 'file' && /\.(mp3|flac|wav|ogg|m4a|opus)$/i.test(this.path)
    },

    isHtml(): boolean {
      return this.entry?.type === 'file' && /\.(html?|xhtml)$/i.test(this.path)
    },

    isJson(): boolean {
      return this.entry?.type === 'file' && /\.json$/i.test(this.path)
    },

    jsonRows(): JsonRow[] {
      if (!this.isJson || !this.jsonReady) return []

      const rows: JsonRow[] = []

      const walk = (
        value: any,
        key: string | null,
        id: string,
        depth: number,
        comma: boolean,
      ) => {
        if (value !== null && typeof value === 'object') {
          const isArray = Array.isArray(value)
          const entries = isArray
            ? value.map((entry: any, index: number) => [String(index), entry] as const)
            : Object.entries(value)

          const expanded =
            this.jsonExpanded[id] !== undefined
              ? this.jsonExpanded[id]
              : depth === 0

          const openingRowIndex = rows.length

          rows.push({
            id,
            depth,
            key,
            type: 'container',
            open: isArray ? '[' : '{',
            close: isArray ? ']' : '}',
            summary: entries.length === 1
              ? '1 item'
              : `${entries.length} items`,
            expandable: entries.length > 0,
            expanded,
            comma,
          })

          if (expanded && entries.length > 0) {
            entries.forEach(([childKey, childValue], index) => {
              walk(
                childValue,
                isArray ? null : childKey,
                `${id}/${childKey}`,
                depth + 1,
                index < entries.length - 1,
              )
            })

            rows.push({
              id: `${id}/__close`,
              depth,
              key: null,
              type: 'close',
              close: isArray ? ']' : '}',
              comma,
            })

            // The opening line itself must not have the comma when expanded;
            // the closing line owns it.
            rows[openingRowIndex].comma = false
          }

          return
        }

        const primitiveType =
          value === null
            ? 'null'
            : typeof value === 'string'
              ? 'string'
              : typeof value === 'number'
                ? 'number'
                : 'boolean'

        rows.push({
          id,
          depth,
          key,
          type: primitiveType,
          value,
          comma,
        })
      }

      walk(this.jsonData, null, '$', 0, false)

      return rows
    },

    entryIcon(): string {
      if (this.entry?.type === 'folder') return 'mdi-folder'
      if (this.isAudio) return 'mdi-volume-high'
      if (this.isHtml) return 'mdi-language-html5'
      if (/\.css$/i.test(this.path)) return 'mdi-language-css3'
      if (/\.(js|ts|mjs|cjs)$/i.test(this.path)) return 'mdi-language-javascript'
      if (/\.(json|yaml|yml|toml)$/i.test(this.path)) return 'mdi-code-json'
      if (/\.(txt|md|log)$/i.test(this.path)) return 'mdi-file-document-outline'
      return 'mdi-file'
    },
  },

  watch: {
    previewUrl: {
      immediate: true,
      handler() {
        void this.loadJsonPreview()
      },
    },

    isJson: {
      immediate: true,
      handler() {
        void this.loadJsonPreview()
      },
    },

    variant: {
      immediate: true,
      handler() {
        void this.loadJsonPreview()
      },
    },
  },

  methods: {
    async loadJsonPreview() {
      if (!this.isJson || this.variant !== 'dialog' || !this.previewUrl) {
        return
      }

      const token = ++this.jsonLoadToken

      this.jsonLoading = true
      this.jsonError = ''
      this.jsonData = null
      this.jsonReady = false
      this.jsonExpanded = {}

      try {
        const response = await fetch(this.previewUrl)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const content = await response.text()
        const parsed = JSON.parse(content)

        if (token !== this.jsonLoadToken) return

        this.jsonData = parsed
        this.jsonReady = true
        this.jsonExpanded = {}
      } catch (error: any) {
        if (token !== this.jsonLoadToken) return

        this.jsonError =
          error?.message
            ? `Invalid JSON: ${error.message}`
            : 'Invalid JSON'
      } finally {
        if (token === this.jsonLoadToken) {
          this.jsonLoading = false
        }
      }
    },

    toggleJsonRow(id: string) {
      this.jsonExpanded = {
        ...this.jsonExpanded,
        [id]: this.jsonExpanded[id] === false,
      }
    },

    handleClick(event: MouseEvent) {
      this.$emit('click', event)
    },

    getCompressedPath(entry: FileEntry | null): string | null {
      if (!entry) return null
      if (typeof entry.compressed === 'string') return this.normalizePath(entry.compressed)
      if (typeof entry.asset === 'object' && typeof entry.asset?.compressed === 'string') {
        return this.normalizePath(entry.asset.compressed)
      }

      return null
    },

    getPublicUrl(value: string): string {
      const normalized = this.normalizePath(value)
      const prefixed = this.withPublicPrefix(normalized)
      const encoded = prefixed
        .split('/')
        .filter(Boolean)
        .map(part => encodeURIComponent(part))
        .join('/')

      return `${this.restApi}/${encoded}`
    },

    withPublicPrefix(value: string): string {
      const normalized = this.normalizePath(value)
      const prefix = this.normalizePath(this.publicPrefix)

      if (!prefix) return normalized
      if (!normalized) return prefix
      if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return normalized

      return `${prefix}/${normalized}`
    },

    normalizePath(value: any): string {
      return String(value ?? '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+/g, '/')
        .replace(/\/+$/, '')
    },
  },
}
</script>

<style scoped>
.file-preview {
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.file-preview--dialog {
  min-height: 520px;
  aspect-ratio: auto;
}

.file-preview--compact {
  min-height: 180px;
}

.file-preview--clickable {
  cursor: zoom-in;
}

.file-preview__media,
.file-preview__iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.file-preview__media {
  object-fit: cover;
}

.file-preview--dialog .file-preview__media {
  object-fit: contain;
}

.file-preview__audio {
  width: calc(100% - 32px);
}

.file-preview__json {
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.55;
  text-align: left;
}

.file-preview__json-state {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.65);
}

.file-preview__json-tree {
  min-width: max-content;
  padding: 12px 0;
}

.file-preview__json-row {
  min-height: 24px;
  padding-right: 16px;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.file-preview__json-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.file-preview__json-toggle {
  width: 22px;
  min-width: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.file-preview__json-key {
  color: #9cdcfe;
}

.file-preview__json-string {
  color: #ce9178;
}

.file-preview__json-number {
  color: #b5cea8;
}

.file-preview__json-boolean {
  color: #569cd6;
}

.file-preview__json-null {
  color: #c586c0;
}

.file-preview__json-summary {
  margin: 0 6px;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
}

.file-preview__json-punctuation {
  color: rgba(255, 255, 255, 0.72);
}

.file-preview__placeholder {
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>

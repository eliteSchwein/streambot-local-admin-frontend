<template>
  <v-dialog
    :model-value="modelValue"
    width="calc(100vw - 32px)"
    max-width="1450"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="restore-dialog d-flex flex-column">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-backup-restore" class="mr-2" />
          <span class="text-truncate">{{ $t('system.maintenance.restoreDialog.title') }}</span>
        </v-toolbar-title>
        <v-btn icon="mdi-close" variant="text" :disabled="loading" @click="close" />
      </v-toolbar>

      <v-divider />

      <v-card-text class="restore-dialog__content pa-4">
        <v-alert type="warning" variant="tonal" density="comfortable" class="mb-3">
          {{ $t('system.maintenance.restoreDialog.warning') }}
        </v-alert>

        <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-3">
          {{ error }}
        </v-alert>

        <template v-if="categories.length">
          <div class="restore-dialog__summary mb-3">
            <div class="min-width-0">
              <div class="text-body-1 font-weight-medium">
                {{ $t('system.maintenance.restoreDialog.description') }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ selectionSummary }}
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap justify-end">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-checkbox-multiple-marked-outline"
                :disabled="loading || allSelected"
                @click="selectAll"
              >
                {{ $t('system.maintenance.restoreDialog.selectAll') }}
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-checkbox-multiple-blank-outline"
                :disabled="loading || selectedLeafCount === 0"
                @click="selectNone"
              >
                {{ $t('system.maintenance.restoreDialog.selectNone') }}
              </v-btn>
            </div>
          </div>

          <div class="restore-dialog__category-grid">
            <v-card
              v-for="category in categories"
              :key="category.key"
              variant="outlined"
              class="restore-dialog__category-card"
              :class="{ 'restore-dialog__category-card--open': isOpen(category.key) && category.items.length }"
            >
              <div class="restore-dialog__category-header" @click="toggleOpen(category.key)">
                <v-checkbox-btn
                  :model-value="categoryState(category).checked"
                  :indeterminate="categoryState(category).indeterminate"
                  color="primary"
                  density="comfortable"
                  :disabled="loading || category.disabled"
                  @click.stop
                  @update:model-value="toggleCategory(category, $event)"
                />

                <v-icon :icon="category.icon" size="small" class="ml-1 mr-2" />

                <div class="min-width-0 flex-grow-1">
                  <div class="text-body-2 font-weight-medium text-truncate">
                    {{ category.label }}
                  </div>
                  <div v-if="category.description" class="restore-dialog__category-description text-caption text-medium-emphasis text-truncate">
                    {{ category.description }}
                  </div>
                </div>

                <v-chip
                  v-if="category.items.length"
                  size="x-small"
                  variant="tonal"
                  class="ml-2 flex-shrink-0"
                >
                  {{ categorySelectedCount(category) }}/{{ categorySelectableCount(category) }}
                </v-chip>

                <v-btn
                  v-if="category.items.length"
                  :icon="isOpen(category.key) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="x-small"
                  variant="text"
                  class="ml-1"
                  :disabled="loading"
                  @click.stop="toggleOpen(category.key)"
                />
              </div>

              <v-expand-transition>
                <div v-if="category.items.length && isOpen(category.key)" class="restore-dialog__category-body">
                  <div class="restore-dialog__category-tools">
                    <span class="text-caption text-medium-emphasis">
                      {{ categorySelectedCount(category) }}/{{ categorySelectableCount(category) }}
                    </span>
                    <v-spacer />
                    <v-btn
                      size="x-small"
                      variant="text"
                      :disabled="loading || categoryState(category).checked"
                      @click="toggleCategory(category, true)"
                    >
                      {{ $t('system.maintenance.restoreDialog.selectAll') }}
                    </v-btn>
                    <v-btn
                      size="x-small"
                      variant="text"
                      :disabled="loading || categorySelectedCount(category) === 0"
                      @click="toggleCategory(category, false)"
                    >
                      {{ $t('system.maintenance.restoreDialog.selectNone') }}
                    </v-btn>
                  </div>

                  <v-text-field
                    :model-value="categorySearch(category.key)"
                    class="restore-dialog__search mb-2"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-magnify"
                    :placeholder="$t('system.maintenance.restoreDialog.searchItems')"
                    :disabled="loading"
                    @update:model-value="setCategorySearch(category.key, $event)"
                  />

                  <div class="restore-dialog__items-scroll">
                    <div v-if="filteredItems(category).length" class="restore-dialog__items">
                      <div
                        v-for="item in filteredItems(category)"
                        :key="item.id"
                        class="restore-dialog__item"
                        :class="{ 'restore-dialog__item--disabled': item.disabled }"
                        @click="toggleItem(item)"
                      >
                        <v-checkbox-btn
                          v-model="item.selected"
                          color="primary"
                          density="comfortable"
                          :disabled="loading || item.disabled"
                          @click.stop
                        />

                        <v-icon :icon="item.icon || 'mdi-file-outline'" size="16" class="mx-1 flex-shrink-0" />

                        <div class="min-width-0 flex-grow-1">
                          <div class="text-caption font-weight-medium text-truncate" :title="item.label">
                            {{ item.label }}
                          </div>
                          <div
                            v-if="item.description && item.description !== item.label"
                            class="restore-dialog__item-detail text-caption text-medium-emphasis text-truncate"
                            :title="item.description"
                          >
                            {{ item.description }}
                          </div>
                        </div>

                        <span v-if="item.size" class="text-caption text-medium-emphasis flex-shrink-0 ml-2">
                          {{ formatBytes(item.size) }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="restore-dialog__empty-search text-caption text-medium-emphasis text-center py-3">
                      {{ $t('system.maintenance.restoreDialog.noSearchResults') }}
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card>
          </div>
        </template>

        <v-alert v-else type="info" variant="tonal" density="comfortable">
          {{ $t('system.maintenance.restoreDialog.noOptions') }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <div v-if="categories.length" class="text-caption text-medium-emphasis ml-1">
          {{ selectionSummary }}
        </div>
        <v-spacer />
        <v-btn variant="text" prepend-icon="mdi-close" :disabled="loading" @click="close">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="warning"
          variant="tonal"
          prepend-icon="mdi-backup-restore"
          :loading="loading"
          :disabled="selectedLeafCount === 0 || categories.length === 0"
          @click="$emit('restore', restorePayload)"
        >
          {{ $t('system.maintenance.restoreDialog.restore') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
type RestoreItem = {
  id: string
  key: string
  value: string
  label: string
  description: string
  icon: string
  size: number
  selected: boolean
  disabled: boolean
  raw: any
}

type RestoreCategory = {
  key: string
  label: string
  description: string
  icon: string
  selected: boolean
  disabled: boolean
  items: RestoreItem[]
  raw: any
}

export default {
  name: 'RestoreBackupDialog',

  props: {
    modelValue: { type: Boolean, default: false },
    payload: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },

  emits: ['update:modelValue', 'restore'],

  data() {
    return {
      categories: [] as RestoreCategory[],
      openCategories: [] as string[],
      categorySearches: {} as Record<string, string>,
      loadedPayload: null as any,
    }
  },

  computed: {
    selectedLeafCount(): number {
      return this.categories.reduce((count, category) => {
        if (category.items.length) return count + category.items.filter(item => item.selected && !item.disabled).length
        return count + (category.selected && !category.disabled ? 1 : 0)
      }, 0)
    },

    selectableLeafCount(): number {
      return this.categories.reduce((count, category) => {
        if (category.items.length) return count + category.items.filter(item => !item.disabled).length
        return count + (!category.disabled ? 1 : 0)
      }, 0)
    },

    allSelected(): boolean {
      return this.selectableLeafCount > 0 && this.selectedLeafCount === this.selectableLeafCount
    },

    selectionSummary(): string {
      return String(this.$t('system.maintenance.restoreDialog.selectedSummary', {
        selected: this.selectedLeafCount,
        total: this.selectableLeafCount,
      }))
    },

    restorePayload(): any {
      const source: any = this.payload ?? {}
      const identity: Record<string, any> = {}
      for (const key of ['id', 'restore_id', 'token', 'uuid', 'path', 'temp_path', 'directory']) {
        if (source[key] !== undefined) identity[key] = source[key]
      }

      const items: string[] = []
      const options: Record<string, boolean> = {}
      const files: Record<string, string[]> = {}
      const selection: Record<string, any> = {}

      for (const category of this.categories) {
        if (category.items.length) {
          const selectable = category.items.filter(item => !item.disabled)
          const selectedItems = selectable.filter(item => item.selected)
          const selectedValues = selectedItems.map(item => item.value)
          const fullCategory = selectable.length > 0 && selectedItems.length === selectable.length

          options[category.key] = selectedItems.length > 0
          files[category.key] = selectedValues
          selection[category.key] = selectedValues

          if (fullCategory) items.push(category.key)
          else items.push(...selectedValues)
        } else if (category.selected && !category.disabled) {
          options[category.key] = true
          selection[category.key] = true
          items.push(category.key)
        } else {
          options[category.key] = false
          selection[category.key] = false
        }
      }

      return {
        ...identity,
        items: [...new Set(items)],
        selected: [...new Set(items)],
        restore: [...new Set(items)],
        options,
        files,
        selection,
      }
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(open: boolean) {
        if (open) this.loadPayload()
      },
    },
    payload: {
      handler() {
        if (!this.modelValue) this.loadedPayload = null
      },
    },
  },

  methods: {
    loadPayload() {
      if (this.loadedPayload === this.payload) return
      this.categories = this.normalizeCategories(this.payload)
      this.openCategories = []
      this.categorySearches = {}
      this.loadedPayload = this.payload
    },

    normalizeCategories(payload: any): RestoreCategory[] {
      const source = payload?.options
        ?? payload?.restore_options
        ?? payload?.available
        ?? payload?.items
        ?? payload?.categories
        ?? payload?.manifest
        ?? payload?.tree
        ?? []

      const entries: Array<[string, any]> = Array.isArray(source)
        ? source.map((item: any, index: number) => [
            typeof item === 'string' ? item : String(item?.key ?? item?.name ?? item?.id ?? item?.value ?? index),
            item,
          ])
        : Object.entries(source ?? {})

      return entries
        .map(([fallbackKey, raw]) => this.normalizeCategory(fallbackKey, raw))
        .filter(Boolean) as RestoreCategory[]
    },

    normalizeCategory(fallbackKey: string, raw: any): RestoreCategory | null {
      if (typeof raw === 'string') return this.makeCategory(raw, {}, true)
      if (typeof raw === 'boolean') return this.makeCategory(fallbackKey, {}, raw)

      const item = raw && typeof raw === 'object' ? raw : {}
      const key = String(item.key ?? item.name ?? item.id ?? item.value ?? fallbackKey).trim()
      if (!key) return null

      const selected = item.default_selected !== false && item.selected !== false && item.default !== false && item.enabled !== false
      const category = this.makeCategory(key, item, selected)

      const childSource = item.files_tree
        ?? item.file_tree
        ?? item.tree
        ?? item.entries
        ?? item.children
        ?? item.files
        ?? item.items
        ?? item.content
        ?? []

      category.items = this.normalizeItems(key, childSource, selected)
      return category
    },

    makeCategory(key: string, raw: any, selected: boolean): RestoreCategory {
      return {
        key,
        label: this.categoryLabel(key, raw?.label ?? raw?.title ?? raw?.name),
        description: this.categoryDescription(key, raw?.description ?? raw?.detail),
        icon: this.categoryIcon(key),
        selected,
        disabled: raw?.disabled === true || raw?.available === false,
        items: [],
        raw,
      }
    },

    normalizeItems(categoryKey: string, source: any, parentSelected: boolean): RestoreItem[] {
      const items: RestoreItem[] = []

      const visit = (entry: any, parentPath = '', indexPath = '0') => {
        if (typeof entry === 'string') {
          const value = this.normalizeRestorePath(entry, categoryKey)
          if (!value) return
          items.push(this.makeItem(categoryKey, value, this.displayFilePath(value, categoryKey), {}, parentSelected, indexPath))
          return
        }

        if (typeof entry === 'boolean') {
          if (!parentPath) return
          const value = this.normalizeRestorePath(parentPath, categoryKey)
          if (!value) return
          items.push(this.makeItem(categoryKey, value, this.displayFilePath(value, categoryKey), {}, entry && parentSelected, indexPath))
          return
        }

        if (!entry || typeof entry !== 'object') return

        const children = entry.children
          ?? entry.entries
          ?? entry.files_tree
          ?? entry.file_tree
          ?? entry.files
          ?? entry.items
          ?? entry.content

        const rawPath = String(entry.path ?? entry.file ?? entry.value ?? entry.key ?? entry.name ?? '').trim()
        const combinedPath = rawPath
          ? (parentPath && !rawPath.includes('/') ? `${parentPath}/${rawPath}` : rawPath)
          : parentPath

        const hasChildren = Array.isArray(children)
          ? children.length > 0
          : Boolean(children && typeof children === 'object' && Object.keys(children).length)

        if (hasChildren) {
          if (Array.isArray(children)) {
            children.forEach((child: any, childIndex: number) => visit(child, combinedPath, `${indexPath}.${childIndex}`))
          } else {
            Object.entries(children).forEach(([childKey, child], childIndex) => {
              if (child && typeof child === 'object' && !Array.isArray(child)) {
                visit({ key: childKey, ...(child as Record<string, any>) }, combinedPath, `${indexPath}.${childIndex}`)
              } else if (typeof child === 'string') {
                visit(child, combinedPath, `${indexPath}.${childIndex}`)
              } else {
                visit({ key: childKey, value: childKey, selected: child !== false }, combinedPath, `${indexPath}.${childIndex}`)
              }
            })
          }
          return
        }

        if (!combinedPath) return
        const value = this.normalizeRestorePath(combinedPath, categoryKey)
        if (!value || value === categoryKey) return
        const label = String(entry.label ?? entry.title ?? this.displayFilePath(value, categoryKey))
        const selected = entry.selected !== false && entry.default !== false && entry.enabled !== false && parentSelected
        items.push(this.makeItem(categoryKey, value, label, entry, selected, indexPath))
      }

      if (Array.isArray(source)) {
        source.forEach((entry, index) => visit(entry, '', String(index)))
      } else if (source && typeof source === 'object') {
        Object.entries(source).forEach(([key, entry], index) => {
          if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            visit({ key, ...(entry as Record<string, any>) }, '', String(index))
          } else if (typeof entry === 'string') {
            visit(entry, '', String(index))
          } else {
            visit({ key, value: key, selected: entry !== false }, '', String(index))
          }
        })
      }

      const unique = new Map<string, RestoreItem>()
      for (const item of items) unique.set(item.value, item)
      return [...unique.values()].sort((a, b) => a.label.localeCompare(b.label))
    },

    makeItem(categoryKey: string, value: string, label: string, raw: any, selected: boolean, index: string): RestoreItem {
      const disabled = raw?.disabled === true || raw?.available === false
      return {
        id: `${categoryKey}:${value}:${index}`,
        key: String(raw?.key ?? raw?.id ?? value),
        value,
        label,
        description: String(raw?.description ?? raw?.detail ?? ''),
        icon: String(raw?.icon ?? ''),
        size: Number(raw?.size_bytes ?? raw?.size ?? raw?.bytes ?? 0) || 0,
        selected: disabled ? false : selected,
        disabled,
        raw,
      }
    },

    normalizeRestorePath(value: string, categoryKey: string): string {
      let path = String(value ?? '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
      if (!path) return ''
      if (!path.includes('/') && path !== categoryKey) path = `${categoryKey}/${path}`
      return path
    },

    displayFilePath(value: string, categoryKey: string): string {
      const prefix = `${categoryKey}/`
      return value.startsWith(prefix) ? value.slice(prefix.length) : value
    },

    categoryLabel(key: string, provided?: string): string {
      const localeKey = this.categoryLocaleKey(key)
      if (localeKey) {
        const path = `system.maintenance.restoreDialog.categories.${localeKey}`
        if (this.$te(path)) return String(this.$t(path))
      }
      if (provided) return String(provided)
      return this.humanize(key)
    },

    categoryDescription(key: string, provided?: string): string {
      const localeKey = this.categoryLocaleKey(key)
      if (localeKey) {
        const path = `system.maintenance.restoreDialog.categoryDescriptions.${localeKey}`
        if (this.$te(path)) return String(this.$t(path))
      }
      return String(provided ?? '')
    },

    categoryLocaleKey(key: string): string {
      const normalized = key.toLowerCase().replace(/\\/g, '/').replace(/^.*\//, '').replace(/\.(json|ya?ml|cfg|conf)$/i, '').replace(/[\s-]+/g, '_')
      const aliases: Record<string, string> = {
        assets: 'media', media: 'media',
        asset_configs: 'assets', assets_configs: 'assets', asset_config: 'assets', assets_config: 'assets',
        compressed_assets: 'compressedMedia', compressed_asset: 'compressedMedia', compressed_media: 'compressedMedia',
        macros: 'macros', macro: 'macros', commands: 'commands', command: 'commands',
        channel_points: 'channelPoints', channelpoints: 'channelPoints', events: 'events', event: 'events',
        auto_macros: 'autoMacros', automacros: 'autoMacros', rotating_scenes: 'rotatingScenes', rotatingscenes: 'rotatingScenes', rotating_scene: 'rotatingScenes',
        integrations: 'integrations', settings: 'settings', streambot_settings: 'settings', variables: 'variables',
        category_library: 'categoryLibrary', categorylibrary: 'categoryLibrary', categories: 'categoryLibrary',
        overlays: 'overlays', overlay: 'overlays', music: 'music',
        streambot_audio_presets: 'audioPresets', audio_presets: 'audioPresets',
        streambot_customization: 'customization', customization: 'customization',
        streambot_audio: 'audio', audio: 'audio',
        streambot_overlays: 'overlays',
      }
      return aliases[normalized] ?? normalized
    },

    categoryIcon(key: string): string {
      const normalized = key.toLowerCase().replace(/[\s-]+/g, '_')
      if (['assets', 'media'].includes(normalized)) return 'mdi-image-multiple-outline'
      if (['asset_configs', 'assets_configs', 'asset_config', 'assets_config'].includes(normalized)) return 'mdi-palette-outline'
      if (['compressed_assets', 'compressed_media'].includes(normalized)) return 'mdi-folder-zip-outline'
      if (normalized.includes('macro')) return 'mdi-code-braces'
      if (normalized.includes('command')) return 'mdi-console-line'
      if (normalized.includes('channel')) return 'mdi-star-circle-outline'
      if (normalized.includes('event')) return 'mdi-lightning-bolt-outline'
      if (normalized.includes('rotating')) return 'mdi-rotate-3d-variant'
      if (normalized.includes('category_library') || normalized === 'categorylibrary' || normalized === 'categories') return 'mdi-gamepad-variant-outline'
      if (normalized.includes('integration')) return 'mdi-connection'
      if (normalized.includes('setting')) return 'mdi-cog-outline'
      if (normalized.includes('variable')) return 'mdi-variable'
      if (normalized.includes('overlay')) return 'mdi-layers-outline'
      if (normalized.includes('music')) return 'mdi-music'
      if (normalized.includes('customization')) return 'mdi-palette-outline'
      return 'mdi-folder-outline'
    },

    categoryState(category: RestoreCategory) {
      if (!category.items.length) return { checked: category.selected && !category.disabled, indeterminate: false }
      const selectable = category.items.filter(item => !item.disabled)
      const selected = selectable.filter(item => item.selected).length
      return {
        checked: selectable.length > 0 && selected === selectable.length,
        indeterminate: selected > 0 && selected < selectable.length,
      }
    },

    categorySelectedCount(category: RestoreCategory): number {
      if (!category.items.length) return category.selected && !category.disabled ? 1 : 0
      return category.items.filter(item => item.selected && !item.disabled).length
    },

    categorySelectableCount(category: RestoreCategory): number {
      if (!category.items.length) return category.disabled ? 0 : 1
      return category.items.filter(item => !item.disabled).length
    },

    toggleCategory(category: RestoreCategory, enabled: boolean | null) {
      if (category.disabled) return
      const value = enabled === true
      category.selected = value
      for (const item of category.items) if (!item.disabled) item.selected = value
    },

    toggleItem(item: RestoreItem) {
      if (this.loading || item.disabled) return
      item.selected = !item.selected
    },

    isOpen(key: string): boolean {
      return this.openCategories.includes(key)
    },

    toggleOpen(key: string) {
      if (this.loading) return
      const index = this.openCategories.indexOf(key)
      if (index >= 0) this.openCategories.splice(index, 1)
      else this.openCategories.push(key)
    },

    categorySearch(key: string): string {
      return this.categorySearches[key] ?? ''
    },

    setCategorySearch(key: string, value: string | null) {
      this.categorySearches = {
        ...this.categorySearches,
        [key]: String(value ?? ''),
      }
    },

    filteredItems(category: RestoreCategory): RestoreItem[] {
      const query = this.categorySearch(category.key).trim().toLocaleLowerCase()
      if (!query) return category.items

      return category.items.filter(item => {
        const haystack = [item.label, item.value, item.description]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()
        return haystack.includes(query)
      })
    },

    selectAll() {
      for (const category of this.categories) this.toggleCategory(category, true)
    },

    selectNone() {
      for (const category of this.categories) this.toggleCategory(category, false)
    },

    humanize(value: string): string {
      return value.replace(/\.(json|ya?ml|cfg|conf)$/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, character => character.toUpperCase())
    },

    formatBytes(value: number): string {
      if (!value || value < 1) return ''
      const units = ['B', 'KiB', 'MiB', 'GiB']
      let size = value
      let index = 0
      while (size >= 1024 && index < units.length - 1) {
        size /= 1024
        index += 1
      }
      return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`
    },

    close() {
      if (this.loading) return
      this.loadedPayload = null
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.restore-dialog {
  width: 100%;
  max-height: calc(100dvh - 32px);
  overflow: hidden;
}

.restore-dialog__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.restore-dialog__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.restore-dialog__category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-items: start;
}

.restore-dialog__category-card {
  min-width: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.38);
  border-color: rgba(var(--v-theme-on-surface), 0.22);
}

.restore-dialog__category-card:hover {
  background: rgba(0, 0, 0, 0.46);
  border-color: rgba(var(--v-theme-on-surface), 0.34);
}

.restore-dialog__category-card--open {
  grid-column: 1 / -1;
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(var(--v-theme-primary), 0.65);
}

.restore-dialog__category-header {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
  justify-content: flex-start;
  text-align: left;
}

.restore-dialog__category-header > .min-width-0 {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.restore-dialog__category-header :deep(.v-checkbox-btn),
.restore-dialog__category-header > .v-icon,
.restore-dialog__category-header > .v-chip,
.restore-dialog__category-header > .v-btn {
  flex: 0 0 auto;
}

.restore-dialog__category-header :deep(.v-icon) {
  opacity: 0.9;
}

.restore-dialog__category-header :deep(.v-chip) {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.restore-dialog__category-description {
  line-height: 1.2;
  opacity: 0.94;
}

.restore-dialog__category-body {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(0, 0, 0, 0.16);
  padding: 8px 10px 10px;
  min-width: 0;
}

.restore-dialog__category-tools {
  min-height: 26px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.restore-dialog__search :deep(.v-field) {
  min-height: 36px;
}

.restore-dialog__items-scroll {
  max-height: min(34dvh, 330px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
}

.restore-dialog__items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
}

.restore-dialog__item {
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.restore-dialog__item:hover {
  background: rgba(0, 0, 0, 0.34);
  border-color: rgba(var(--v-theme-on-surface), 0.22);
}

.restore-dialog__item--disabled {
  cursor: default;
  opacity: 0.55;
}

.restore-dialog__item-detail {
  line-height: 1.1;
}

.restore-dialog__empty-search {
  min-height: 42px;
}

@media (min-width: 1600px) {
  .restore-dialog__category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .restore-dialog__items {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 959px) {
  .restore-dialog {
    max-height: calc(100dvh - 16px);
  }

  .restore-dialog__summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .restore-dialog__category-grid,
  .restore-dialog__items {
    grid-template-columns: 1fr;
  }

  .restore-dialog__items-scroll {
    max-height: min(38dvh, 360px);
  }
}
</style>

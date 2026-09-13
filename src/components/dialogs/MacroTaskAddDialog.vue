<template>
  <v-dialog
    :model-value="modelValue"
    width="96vw"
    max-width="780"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4" class="macro-task-add-dialog">
      <v-toolbar flat density="comfortable">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-plus-box-outline" class="mr-2" />
          <span class="text-truncate">{{ $t('dialogs.macroTaskAddDialog.title') }}</span>
        </v-toolbar-title>

        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-0">
        <div class="macro-task-add-dialog__search pa-4 pb-3">
          <v-text-field
            ref="searchField"
            v-model="search"
            :label="$t('dialogs.macroTaskAddDialog.search')"
            :placeholder="$t('dialogs.macroTaskAddDialog.searchPlaceholder')"
            prepend-inner-icon="mdi-magnify"
            clearable
            autofocus
            variant="outlined"
            density="comfortable"
            hide-details
            @keydown.esc.stop="handleEscape"
          />
        </div>

        <v-divider />

        <div class="macro-task-add-dialog__content pa-3 pt-2">
          <MacroTaskPresetTree
            v-if="filteredTree.length"
            :nodes="filteredTree"
            :expanded="visibleExpanded"
            @select="selectPreset"
          />

          <v-alert
            v-else
            type="info"
            variant="tonal"
            density="comfortable"
            :text="$t('dialogs.macroTaskAddDialog.noResults')"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">
          {{ $t('common.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import MacroTaskPresetTree from './MacroTaskPresetTree.vue'

type Preset = {
  titleKey?: string
  title?: string
  icon?: string
  children?: Preset[]
  create?: () => any
}

type TreeNode = {
  __key: string
  title: string
  icon?: string
  children?: TreeNode[]
  preset?: Preset
  searchText: string
}

export default {
  name: 'MacroTaskAddDialog',

  components: {
    MacroTaskPresetTree,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    presets: { type: Array, default: () => [] },
  },

  emits: ['update:modelValue', 'select'],

  data() {
    return {
      search: '',
      expanded: {} as Record<string, boolean>,
    }
  },

  computed: {
    presetTree(): TreeNode[] {
      return this.buildTree(this.presets as Preset[])
    },

    filteredTree(): TreeNode[] {
      const query = this.normalizeSearch(this.search)
      if (!query) return this.presetTree
      return this.filterTree(this.presetTree, query)
    },

    visibleExpanded(): Record<string, boolean> {
      if (!this.normalizeSearch(this.search)) return this.expanded

      const expanded = { ...this.expanded }
      this.expandAllGroups(this.filteredTree, expanded)
      return expanded
    },
  },

  watch: {
    modelValue(value: boolean) {
      if (!value) return

      this.search = ''
      this.$nextTick(() => {
        const field = this.$refs.searchField as any
        field?.focus?.()
      })
    },
  },

  methods: {
    presetTitle(preset: Preset): string {
      if (preset?.titleKey) return String(this.$t(preset.titleKey))
      return String(preset?.title ?? '')
    },

    normalizeSearch(value: unknown): string {
      return String(value ?? '').trim().toLocaleLowerCase()
    },

    buildTree(presets: Preset[], parents: string[] = []): TreeNode[] {
      return (presets ?? [])
        .map((preset, index) => {
          const title = this.presetTitle(preset)
          const currentPath = [...parents, preset.titleKey || preset.title || String(index)]
          const key = currentPath.join('::')
          const children = preset.children?.length ? this.buildTree(preset.children, currentPath) : undefined

          return {
            __key: key,
            title,
            icon: preset.icon,
            children,
            preset: children?.length ? undefined : preset,
            searchText: this.normalizeSearch([...parents, title].join(' ')),
          }
        })
        .filter((node) => node.children?.length || typeof node.preset?.create === 'function')
    },

    filterTree(nodes: TreeNode[], query: string): TreeNode[] {
      const result: TreeNode[] = []

      for (const node of nodes) {
        const filteredChildren = node.children?.length ? this.filterTree(node.children, query) : undefined
        const selfMatches = node.searchText.includes(query) || this.normalizeSearch(node.title).includes(query)

        if (node.children?.length) {
          if (filteredChildren?.length) {
            result.push({ ...node, children: filteredChildren })
          } else if (selfMatches) {
            result.push({ ...node, children: node.children })
          }
          continue
        }

        if (selfMatches) result.push(node)
      }

      return result
    },

    expandAllGroups(nodes: TreeNode[], target: Record<string, boolean>) {
      for (const node of nodes) {
        if (!node.children?.length) continue
        target[node.__key] = true
        this.expandAllGroups(node.children, target)
      }
    },

    selectPreset(preset: Preset) {
      this.$emit('select', preset)
      this.close()
    },

    handleEscape() {
      if (this.search) {
        this.search = ''
        return
      }

      this.close()
    },

    close() {
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
.macro-task-add-dialog__search {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-grey-darken-4));
}

.macro-task-add-dialog__content {
  min-height: 260px;
  max-height: min(68vh, 760px);
  overflow-y: auto;
}
</style>

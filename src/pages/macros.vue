<template>
  <v-card class="overflow-auto mx-auto" max-height="100%" elevation="0" color="transparent" max-width="100%">
    <v-card-title class="d-flex align-center justify-space-between px-3 pt-3">
      <div class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-code-braces" />
        <div class="min-width-0">
          <div class="text-truncate">{{ $t('macro.title') || 'Macros' }}</div>
        </div>
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn
          prepend-icon="mdi-plus"
          color="primary"
          variant="tonal"
          @click="createDialog = true"
        >
          {{ $t('macro.createFile') }}
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row density="compact" class="mb-3">
        <v-col cols="12" md="6">
          <StorageCard
            ref="storageCard"
            :hide-macro-used="false"
          />
        </v-col>

        <v-col cols="12" md="6">
          <UploadCard
            ref="uploadCard"
            :label="$t('macro.upload') || 'Upload macro'"
            :drop-label="$t('file.dropFiles') || 'Drop files here'"
            icon="mdi-upload"
            accept=".yaml,.yml"
            :loading="uploading"
            @upload="uploadFiles"
          />
        </v-col>
      </v-row>

      <div class="macro-toolbar mb-3">
        <v-text-field
          v-model="searchQuery"
          :label="$t('macro.search') || 'Search macros'"
          prepend-inner-icon="mdi-magnify"
          clearable
          variant="outlined"
          density="compact"
          hide-details
          class="macro-toolbar__search"
        />

        <v-menu
          v-model="filterMenu"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="tonal"
              height="40"
              prepend-icon="mdi-filter-variant"
            >
              {{ $t('macro.filters.title') }}
              <v-badge
                v-if="activeFilterCount > 0"
                :content="activeFilterCount"
                color="primary"
                inline
                class="ml-2"
              />
            </v-btn>
          </template>

          <v-card min-width="320" max-width="380">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1">
              <v-icon icon="mdi-filter-variant" />
              {{ $t('macro.filters.title') }}
            </v-card-title>

            <v-card-text class="d-flex flex-column ga-3">
              <v-select
                v-model="cloudFilter"
                :items="cloudFilterItems"
                :label="$t('macro.filters.cloud')"
                variant="outlined"
                density="compact"
                hide-details
              />

              <v-select
                v-model="descriptionFilter"
                :items="descriptionFilterItems"
                :label="$t('macro.filters.description')"
                variant="outlined"
                density="compact"
                hide-details
              />

              <v-select
                v-model="taskFilter"
                :items="taskFilterItems"
                :label="$t('macro.filters.tasks')"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-card-text>

            <v-card-actions>
              <v-btn
                variant="text"
                prepend-icon="mdi-filter-remove"
                :disabled="activeFilterCount === 0"
                @click="resetFilters"
              >
                {{ $t('macro.filters.reset') }}
              </v-btn>

              <v-spacer />

              <v-btn
                color="primary"
                variant="tonal"
                @click="filterMenu = false"
              >
                {{ $t('common.close') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <v-select
          v-model="sortBy"
          :items="sortItems"
          :label="$t('macro.sort.title')"
          variant="outlined"
          density="compact"
          hide-details
          class="macro-toolbar__sort"
        />

        <v-btn
          variant="tonal"
          height="40"
          min-width="40"
          :icon="sortDirection === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
          :title="sortDirection === 'asc' ? $t('macro.sort.ascending') : $t('macro.sort.descending')"
          @click="toggleSortDirection"
        />
      </div>

      <div
        v-if="searchQuery || activeFilterCount > 0"
        class="d-flex align-center ga-2 mb-3 text-caption text-medium-emphasis"
      >
        <span>
          {{ $t('macro.filteredCount', { shown: filteredMacros.length, total: macroList.length }) }}
        </span>

        <v-btn
          v-if="searchQuery || activeFilterCount > 0"
          size="x-small"
          variant="text"
          prepend-icon="mdi-close"
          @click="resetListControls"
        >
          {{ $t('macro.clearSearchAndFilters') }}
        </v-btn>
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        color="red-darken-3"
        class="mb-4"
        :text="errorMessage"
      />

      <v-alert
        v-if="filteredMacros.length === 0"
        type="info"
        color="grey-darken-3"
        :text="$t('macro.noMacrosFound') || 'No macros found'"
      />

      <div
        v-else
        class="macro-list"
      >
        <Macro
          v-for="item in filteredMacros"
          :key="item.name"
          :macro="item.macro"
          :name="item.name"
          :disabled="workingName === item.name"
          :deleting="workingName === item.name && workingAction === 'delete'"
          @edit="openEditor"
          @delete="openDeleteDialog"
        />
      </div>
    </v-card-text>

    <MacroEditorDialog
      ref="macroEditorDialog"
      v-model="editorDialog"
      :name="selectedMacroName"
      :macro="selectedMacro"
      :file-path="selectedMacroFile"
      :loading="workingAction === 'save' || workingAction === 'read'"
      @saved="handleEditorSaved"
    />

    <MacroDeleteConfirmDialog
      v-model="deleteDialog"
      :name="selectedDeleteName"
      :macro="selectedDeleteMacro"
      :loading="workingAction === 'delete'"
      @confirm="confirmDeleteMacro"
    />

    <MacroCreateDialog
      v-model="createDialog"
      @created="handleMacroCreated"
    />
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import StorageCard from '@/components/cards/StorageCard.vue'
import UploadCard from '@/components/cards/UploadCard.vue'
import Macro from '@/components/Macro.vue'
import MacroEditorDialog from '@/components/dialogs/MacroEditorDialog.vue'
import MacroDeleteConfirmDialog from '@/components/dialogs/MacroDeleteConfirmDialog.vue'
import MacroCreateDialog from '@/components/dialogs/MacroCreateDialog.vue'
import { isHiddenMacroName } from '@/helper/MacroHelper'

type MacroEntry = {
  name: string
  macro: any
}

export default {
  name: 'Macros',

  components: {
    StorageCard,
    UploadCard,
    Macro,
    MacroEditorDialog,
    MacroDeleteConfirmDialog,
    MacroCreateDialog,
  },

  data() {
    return {
      searchQuery: '',
      filterMenu: false,
      cloudFilter: 'all' as 'all' | 'cloud' | 'hidden',
      descriptionFilter: 'all' as 'all' | 'with' | 'without',
      taskFilter: 'all' as 'all' | 'with' | 'empty',
      sortBy: 'name' as 'name' | 'tasks' | 'description' | 'cloud',
      sortDirection: 'asc' as 'asc' | 'desc',
      loading: false,
      uploading: false,
      errorMessage: '',
      editorDialog: false,
      deleteDialog: false,
      createDialog: false,
      selectedMacroName: '',
      selectedMacro: null as any,
      selectedMacroFile: '',
      selectedDeleteName: '',
      selectedDeleteMacro: null as any,
      workingName: null as string | null,
      workingAction: null as string | null,
    }
  },

  computed: {
    ...mapState(useAppStore, ['getMacros', 'getRestApi']),

    macroList(): MacroEntry[] {
      return Object.entries(this.getMacros ?? {})
        .map(([name, macro]) => ({ name, macro }))
        .filter(item => !isHiddenMacroName(item.name))
    },

    cloudFilterItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.filters.all')), value: 'all' },
        { title: String(this.$t('macro.filters.cloudVisible')), value: 'cloud' },
        { title: String(this.$t('macro.filters.cloudHidden')), value: 'hidden' },
      ]
    },

    descriptionFilterItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.filters.all')), value: 'all' },
        { title: String(this.$t('macro.filters.hasDescription')), value: 'with' },
        { title: String(this.$t('macro.filters.noDescription')), value: 'without' },
      ]
    },

    taskFilterItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.filters.all')), value: 'all' },
        { title: String(this.$t('macro.filters.hasTasks')), value: 'with' },
        { title: String(this.$t('macro.filters.empty')), value: 'empty' },
      ]
    },

    sortItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('macro.sort.name')), value: 'name' },
        { title: String(this.$t('macro.sort.tasks')), value: 'tasks' },
        { title: String(this.$t('macro.sort.description')), value: 'description' },
        { title: String(this.$t('macro.sort.cloud')), value: 'cloud' },
      ]
    },

    activeFilterCount(): number {
      return [this.cloudFilter, this.descriptionFilter, this.taskFilter]
        .filter(value => value !== 'all')
        .length
    },

    filteredMacros(): MacroEntry[] {
      const query = String(this.searchQuery ?? '').trim().toLocaleLowerCase()

      const filtered = this.macroList.filter((item) => {
        const description = String(item.macro?.description ?? '').trim()
        const taskCount = Array.isArray(item.macro?.tasks) ? item.macro.tasks.length : 0
        const hiddenFromCloud = item.macro?.hide_from_cloud === true

        if (this.cloudFilter === 'cloud' && hiddenFromCloud) return false
        if (this.cloudFilter === 'hidden' && !hiddenFromCloud) return false

        if (this.descriptionFilter === 'with' && !description) return false
        if (this.descriptionFilter === 'without' && description) return false

        if (this.taskFilter === 'with' && taskCount === 0) return false
        if (this.taskFilter === 'empty' && taskCount > 0) return false

        if (!query) return true

        return (
          item.name.toLocaleLowerCase().includes(query) ||
          description.toLocaleLowerCase().includes(query) ||
          JSON.stringify(item.macro?.tasks ?? []).toLocaleLowerCase().includes(query)
        )
      })

      const direction = this.sortDirection === 'asc' ? 1 : -1

      return filtered.sort((a, b) => {
        let result = 0

        switch (this.sortBy) {
          case 'tasks': {
            const aTasks = Array.isArray(a.macro?.tasks) ? a.macro.tasks.length : 0
            const bTasks = Array.isArray(b.macro?.tasks) ? b.macro.tasks.length : 0
            result = aTasks - bTasks
            break
          }
          case 'description':
            result = String(a.macro?.description ?? '').localeCompare(String(b.macro?.description ?? ''), undefined, { sensitivity: 'base' })
            break
          case 'cloud':
            result = Number(a.macro?.hide_from_cloud === true) - Number(b.macro?.hide_from_cloud === true)
            break
          case 'name':
          default:
            result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            break
        }

        if (result === 0 && this.sortBy !== 'name') {
          result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        }

        return result * direction
      })
    },
  },

  methods: {
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    },

    resetFilters() {
      this.cloudFilter = 'all'
      this.descriptionFilter = 'all'
      this.taskFilter = 'all'
    },

    resetListControls() {
      this.searchQuery = ''
      this.resetFilters()
    },

    async requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 30_000): Promise<any> {
      const client = getWebsocketClient()

      if (!client) {
        throw new Error('websocket is not connected')
      }

      const response = await client.request(method, params, timeout)
      return response?.params ?? response
    },

    getWebsocketResultKey(method: string) {
      return `result_${String(method ?? '').replace(/[^a-zA-Z0-9_]/g, '_')}`
    },

    unwrapWebsocketResponse(response: any, method = ''): any {
      const resultKey = method ? this.getWebsocketResultKey(method) : ''
      const containers = [response, response?.data, response?.payload, response?.result].filter(Boolean)

      if (resultKey) {
        for (const container of containers) {
          if (container && typeof container === 'object' && Object.prototype.hasOwnProperty.call(container, resultKey)) {
            return container[resultKey]
          }
        }
      }

      for (const container of containers) {
        if (container && typeof container === 'object') {
          if (Object.prototype.hasOwnProperty.call(container, 'result')) return container.result
          if (Object.prototype.hasOwnProperty.call(container, 'data')) return container.data
          if (Object.prototype.hasOwnProperty.call(container, 'payload')) return container.payload
        }
      }

      return response
    },

    assertWebsocketResponse(data: any, fallbackMessage: string) {
      if (data?.error) {
        throw new Error(data.error)
      }

      if (data?.success === false) {
        throw new Error(data?.message ?? fallbackMessage)
      }

      return data
    },

    async requestMacroEndpoint(method: string, params: Record<string, any> = {}, timeout = 30_000): Promise<any> {
      const response = await this.requestWebsocket(method, params, timeout)
      const data = this.unwrapWebsocketResponse(response, method)
      return this.assertWebsocketResponse(data, `${method} failed`)
    },

    async uploadFiles(files: File[] | FileList) {
      const fileList = Array.from(files as any)

      if (fileList.length === 0) return

      this.uploading = true
      this.errorMessage = ''

      try {
        const formData = new FormData()

        fileList.forEach((file) => {
          formData.append('files', file)
        })

        const response = await fetch(`${this.getRestApi}/api/macro/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data?.error) {
          throw new Error(data?.error ?? 'macro upload failed')
        }

        await (this.$refs.storageCard as any)?.fetchStorageInfo?.()
        ;(this.$refs.uploadCard as any)?.reset?.()
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'macro upload failed'
      } finally {
        this.uploading = false
      }
    },

    openEditor(name: string, macro: any) {
      this.selectedMacroName = name
      this.selectedMacro = macro
      this.selectedMacroFile = macro?.file ?? `${name}.yaml`
      this.editorDialog = true
      this.$nextTick(() => {
        ;(this.$refs.macroEditorDialog as any)?.open?.()
      })
    },

    openDeleteDialog(name: string, macro: any) {
      this.selectedDeleteName = name
      this.selectedDeleteMacro = macro
      this.deleteDialog = true
    },

    async confirmDeleteMacro() {
      if (!this.selectedDeleteName || this.workingAction) return

      this.workingName = this.selectedDeleteName
      this.workingAction = 'delete'
      this.errorMessage = ''

      try {
        await this.requestMacroEndpoint('macro_delete', {
          path: this.selectedDeleteMacro?.file ?? undefined,
          name: this.selectedDeleteName,
        })

        this.deleteDialog = false
        this.selectedDeleteName = ''
        this.selectedDeleteMacro = null
        this.selectedMacroFile = ''

        await (this.$refs.storageCard as any)?.fetchStorageInfo?.()
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'delete macro failed'
      } finally {
        this.workingName = null
        this.workingAction = null
      }
    },

    async handleMacroCreated(path: string) {
      const fileName = String(path ?? '').split('/').pop() ?? ''
      const name = fileName.replace(/\.ya?ml$/i, '')

      await (this.$refs.storageCard as any)?.fetchStorageInfo?.()

      if (name) {
        this.openEditor(name, { file: fileName, apis: [], tasks: [] })
      }
    },

    async handleEditorSaved() {
      this.editorDialog = false
      await (this.$refs.storageCard as any)?.fetchStorageInfo?.()
    },
  },
}
</script>

<style scoped lang="scss">
.macro-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.macro-toolbar__search {
  min-width: 220px;
  flex: 1 1 420px;
}

.macro-toolbar__sort {
  flex: 0 1 220px;
  min-width: 180px;
}

.macro-list {
  overflow: hidden;
  border-radius: 4px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 800px) {
  .macro-toolbar {
    flex-wrap: wrap;
  }

  .macro-toolbar__search {
    flex-basis: 100%;
  }

  .macro-toolbar__sort {
    flex: 1 1 180px;
  }
}
</style>

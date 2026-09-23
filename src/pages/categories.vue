<template>
  <v-card class="overflow-auto mx-auto" max-height="100%" elevation="0" color="transparent" max-width="100%">
    <v-card-title class="d-flex flex-wrap align-center ga-2 px-3 pt-3">
      <v-icon icon="mdi-gamepad-variant-outline" />
      <span>{{ $t('categoryLibrary.title') }}</span>
      <v-chip v-if="categories.length" size="x-small" variant="tonal">{{ categories.length }}</v-chip>

      <v-spacer />

      <v-btn
        prepend-icon="mdi-view-grid-plus-outline"
        variant="tonal"
        color="primary"
        @click="mediaSlotsDialog = true"
      >
        {{ $t('categoryLibrary.mediaSlots.button') }}
      </v-btn>
    </v-card-title>

    <v-card-text class="px-3 pb-3">
      <v-alert
        v-if="!categoryLibraryEnabled"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        {{ $t('categoryLibrary.disabledHint') }}
      </v-alert>

      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :label="$t('categoryLibrary.search')"
        clearable
        variant="outlined"
        density="compact"
        hide-details
        class="mb-4"
      />

      <v-data-table
        :headers="headers"
        :items="filteredCategories"
        item-value="category_id"
        :items-per-page="25"
        :items-per-page-options="[10, 25, 50, 100]"
        density="compact"
        class="category-table"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-3 py-1">
            <div class="category-thumb">
              <AssetPreview
                v-if="item.cover_path"
                :asset="{ path: item.cover_path, type: 'file' }"
                :rest-api="appStore.getRestApi"
                variant="thumbnail"
                :show-label="false"
                :controls="false"
              />
              <v-icon v-else icon="mdi-controller-classic-outline" size="24" />
            </div>

            <div class="min-width-0">
              <div class="d-flex align-center ga-2">
                <span class="font-weight-medium text-truncate">{{ item.name }}</span>
                <v-chip
                  v-if="isActive(item)"
                  color="success"
                  size="x-small"
                  variant="tonal"
                >
                  {{ $t('categoryLibrary.active') }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                Twitch ID {{ item.category_id }}
              </div>
            </div>
          </div>
        </template>

        <template #item.media="{ item }">
          <div class="d-flex align-center ga-1">
            <v-icon
              :icon="item.custom_media?.length ? 'mdi-image-multiple-outline' : 'mdi-image-off-outline'"
              size="18"
              :class="item.custom_media?.length ? '' : 'text-medium-emphasis'"
            />
            <span>{{ item.custom_media?.length ?? 0 }}</span>
          </div>
        </template>

        <template #item.features="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-if="item.wallpaper_path"
              size="x-small"
              variant="tonal"
              prepend-icon="mdi-wallpaper"
            >
              {{ $t('categoryLibrary.wallpaper') }}
            </v-chip>
            <v-chip
              v-if="item.custom_css"
              size="x-small"
              variant="tonal"
              prepend-icon="mdi-language-css3"
            >
              CSS
            </v-chip>
            <v-chip
              v-if="item.obs_filters && Object.keys(item.obs_filters).length"
              size="x-small"
              variant="tonal"
              prepend-icon="mdi-filter-cog-outline"
            >
              OBS
            </v-chip>
            <v-chip
              v-if="item.channel_points?.length"
              size="x-small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-star-circle-outline"
            >
              +{{ item.channel_points.length }}
            </v-chip>
            <v-chip
              v-if="item.blocked_channel_points?.length"
              size="x-small"
              color="error"
              variant="tonal"
              prepend-icon="mdi-star-off-outline"
            >
              -{{ item.blocked_channel_points.length }}
            </v-chip>
            <v-chip
              v-if="item.use_as_media_fallback"
              size="x-small"
              color="secondary"
              variant="tonal"
              prepend-icon="mdi-backup-restore"
            >
              {{ $t('categoryLibrary.fallback') }}
            </v-chip>
            <v-chip v-if="item.theme_color" size="x-small" variant="tonal">
              <span
                class="category-color-dot mr-1"
                :style="{ backgroundColor: `#${String(item.theme_color).replace(/^#/, '')}` }"
              />
              #{{ String(item.theme_color).replace(/^#/, '') }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1 category-actions">
            <v-btn
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              :title="$t('common.edit')"
              @click="editCategory(item)"
            />
            <v-btn
              icon="mdi-refresh"
              size="small"
              variant="text"
              :title="$t('categoryLibrary.refresh')"
              :loading="refreshingId === String(item.category_id)"
              @click="refreshCategory(item)"
            />
            <v-btn
              v-if="!isActive(item)"
              icon="mdi-play"
              size="small"
              color="primary"
              variant="text"
              :title="$t('categoryLibrary.activate')"
              :loading="activatingId === String(item.category_id)"
              @click="activateCategory(item)"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              color="error"
              variant="text"
              :title="$t('common.delete')"
              @click="requestDelete(item)"
            />
          </div>
        </template>

        <template #no-data>
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="ma-3"
            :text="$t('categoryLibrary.empty')"
          />
        </template>
      </v-data-table>
    </v-card-text>

    <CategoryLibraryEditorDialog
      v-model="editorOpen"
      :category="editingCategory"
      :rest-api="appStore.getRestApi"
      :saving="saving"
      :refreshing="refreshingId === String(editingCategory?.category_id ?? '')"
      :media-slots="mediaSlots"
      :current-obs-filters="currentObsFilters"
      :current-obs-sources="currentObsSources"
      :fallback-obs-filters="fallbackObsFilters"
      :available-channel-points="availableChannelPoints"
      @save="saveCategory"
      @refresh="refreshCategoryById"
    />

    <CategoryMediaSlotsDialog
      v-model="mediaSlotsDialog"
      :slots="mediaSlots"
      :saving="savingMediaSlots"
      @save="saveMediaSlots"
    />

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card color="grey-darken-4">
        <v-toolbar flat density="comfortable">
          <v-toolbar-title>{{ $t('categoryLibrary.deleteTitle') }}</v-toolbar-title>
          <v-btn variant="text" @click="deleteDialog = false">
            <v-icon icon="mdi-close" />
          </v-btn>
        </v-toolbar>
        <v-card-text>
          {{ $t('categoryLibrary.deleteText', { name: deletingCategory?.name ?? '' }) }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteCategory">
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import AssetPreview from '@/components/AssetPreview.vue'
import CategoryLibraryEditorDialog from '@/components/dialogs/CategoryLibraryEditorDialog.vue'
import CategoryMediaSlotsDialog from '@/components/dialogs/CategoryMediaSlotsDialog.vue'

export default {
  name: 'CategoryLibraryPage',

  components: {
    AssetPreview,
    CategoryLibraryEditorDialog,
    CategoryMediaSlotsDialog,
  },

  data() {
    return {
      appStore: useAppStore(),
      search: '',
      editorOpen: false,
      editingCategory: null as any,
      mediaSlotsDialog: false,
      deleteDialog: false,
      deletingCategory: null as any,
      saving: false,
      savingMediaSlots: false,
      deleting: false,
      refreshingId: '',
      activatingId: '',
    }
  },

  computed: {
    library(): any {
      return this.appStore.getCategoryLibrary ?? {
        enabled: false,
        active_category_id: null,
        categories: [],
      }
    },

    categories(): any[] {
      return Array.isArray(this.library?.categories) ? this.library.categories : []
    },

    mediaSlots(): any[] {
      const librarySlots = this.library?.settings?.media_slots
      if (Array.isArray(librarySlots)) return librarySlots

      const settingsSlots = this.appStore.getSettings?.category_library?.media_slots
      return Array.isArray(settingsSlots) ? settingsSlots : []
    },

    currentObsFilters(): Record<string, any> {
      const scene = this.appStore.getScene as any
      const sources = scene?.sources
      return sources && typeof sources === 'object' && !Array.isArray(sources)
        ? sources
        : {}
    },

    currentObsSources(): Record<string, any> {
      const result: Record<string, any> = {}
      const roots = Array.isArray(this.appStore.getObsSceneData)
        ? this.appStore.getObsSceneData
        : []

      const collectItems = (items: any[], obsId = 'default') => {
        for (const item of items ?? []) {
          const uuid = String(item?.uuid ?? item?.sourceUuid ?? '').trim()
          if (uuid) {
            result[uuid] = {
              ...item,
              uuid,
              name: String(item?.name ?? item?.sourceName ?? uuid),
              obs_id: String(item?.obs_id ?? item?.obsId ?? obsId ?? 'default'),
            }
          }

          if (Array.isArray(item?.children) && item.children.length) {
            collectItems(item.children, obsId)
          }
        }
      }

      for (const root of roots) {
        const obsId = String(root?.obs_id ?? root?.obsId ?? root?.connection ?? 'default')

        if (Array.isArray(root?.scenes)) {
          for (const scene of root.scenes) {
            collectItems(scene?.items ?? scene?.sources ?? [], obsId)
          }
        } else {
          collectItems(root?.items ?? root?.sources ?? [], obsId)
        }
      }

      return result
    },

    fallbackObsFilters(): Record<string, any> {
      const fallbackCategory = this.categories.find(
        (category: any) => category?.use_as_media_fallback === true,
      )

      return fallbackCategory?.obs_filters &&
        typeof fallbackCategory.obs_filters === 'object' &&
        !Array.isArray(fallbackCategory.obs_filters)
        ? fallbackCategory.obs_filters
        : {}
    },

    availableChannelPoints(): Array<{ title: string; value: string; defaultEnabled: boolean }> {
      const points = Array.isArray((this.appStore as any).getChannelPoints?.all)
        ? (this.appStore as any).getChannelPoints.all
        : []

      const seen = new Set<string>()
      const result: Array<{ title: string; value: string; defaultEnabled: boolean }> = []

      for (const point of points) {
        const name = String(point?.label ?? point?.name ?? '').trim()
        if (!name) continue

        const key = name.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)

        result.push({
          title: name,
          value: name,
          defaultEnabled: point?.enable_default === true,
        })
      }

      return result.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true }),
      )
    },

    categoryLibraryEnabled(): boolean {
      const settingsEnabled = this.appStore.getSettings?.category_library?.enabled
      if (typeof settingsEnabled === 'boolean') return settingsEnabled

      const snapshotEnabled = this.library?.enabled
      if (typeof snapshotEnabled === 'boolean') return snapshotEnabled

      return Boolean(this.library?.settings?.enabled)
    },

    filteredCategories(): any[] {
      const query = String(this.search ?? '').trim().toLowerCase()
      if (!query) return this.categories

      return this.categories.filter((category: any) =>
        [
          category?.name,
          category?.category_id,
          category?.steam_app_id,
          ...(Array.isArray(category?.custom_media)
            ? category.custom_media.flatMap((media: any) => [media?.name, media?.path])
            : []),
        ].some(value => String(value ?? '').toLowerCase().includes(query)),
      )
    },

    headers(): any[] {
      return [
        { title: String(this.$t('categoryLibrary.columns.category')), key: 'name', sortable: true },
        { title: String(this.$t('categoryLibrary.columns.media')), key: 'media', sortable: false, width: 90 },
        { title: String(this.$t('categoryLibrary.columns.features')), key: 'features', sortable: false },
        { title: String(this.$t('categoryLibrary.columns.updated')), key: 'updated_at', sortable: true, width: 190 },
        { title: '', key: 'actions', sortable: false, align: 'end', width: 180 },
      ]
    },
  },

  methods: {
    unwrap(response: any, method: string): any {
      const params = response?.params ?? response
      return params?.[`result_${method}`] ?? params?.data ?? params
    },

    async request(method: string, data: any = {}, timeout = 20_000): Promise<any> {
      const client: any = getWebsocketClient()
      if (!client?.request) throw new Error('websocket is not connected')
      const response = await client.request(method, data, timeout)
      const result = this.unwrap(response, method)
      if (result?.error) throw new Error(result.error)
      return result
    },

    isActive(category: any): boolean {
      return String(this.library.active_category_id ?? '') === String(category?.category_id ?? '')
    },

    editCategory(category: any) {
      this.editingCategory = JSON.parse(JSON.stringify(category))
      this.editorOpen = true
    },

    async saveCategory(category: any) {
      this.saving = true
      try {
        const data = await this.request('category_library_save', { category })
        this.editingCategory = data?.category ?? category
        this.editorOpen = false
      } catch (error) {
        console.error('saving category failed', error)
      } finally {
        this.saving = false
      }
    },

    async saveMediaSlots(slots: any[]) {
      this.savingMediaSlots = true
      try {
        await this.request('settings_save', {
          category_library: {
            media_slots: slots,
          },
        })
        this.mediaSlotsDialog = false
      } catch (error) {
        console.error('saving category media slots failed', error)
      } finally {
        this.savingMediaSlots = false
      }
    },

    async refreshCategory(category: any) {
      await this.refreshCategoryById(category?.category_id)
    },

    async refreshCategoryById(categoryId: any) {
      const id = String(categoryId ?? '')
      if (!id) return

      this.refreshingId = id
      try {
        const data = await this.request('category_library_refresh', { category_id: id }, 60_000)
        if (this.editorOpen && String(this.editingCategory?.category_id ?? '') === id && data?.category) {
          this.editingCategory = JSON.parse(JSON.stringify(data.category))
        }
      } catch (error) {
        console.error('refreshing category failed', error)
      } finally {
        this.refreshingId = ''
      }
    },

    async activateCategory(category: any) {
      const id = String(category?.category_id ?? '')
      if (!id) return

      this.activatingId = id
      try {
        await this.request('category_library_activate', { category_id: id })
      } catch (error) {
        console.error('activating category failed', error)
      } finally {
        this.activatingId = ''
      }
    },

    requestDelete(category: any) {
      this.deletingCategory = category
      this.deleteDialog = true
    },

    async deleteCategory() {
      const id = String(this.deletingCategory?.category_id ?? '')
      if (!id) return

      this.deleting = true
      try {
        await this.request('category_library_delete', { category_id: id })
        this.deleteDialog = false
        this.deletingCategory = null
      } catch (error) {
        console.error('deleting category failed', error)
      } finally {
        this.deleting = false
      }
    },
  },
}
</script>

<style scoped>
.category-table {
  background: rgba(var(--v-theme-surface), .24);
  border-radius: 8px;
}

.category-thumb {
  width: 56px;
  height: 72px;
  flex: 0 0 56px;
  border-radius: 5px;
  overflow: hidden;
  background: rgba(0, 0, 0, .22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), .45);
}

.category-thumb :deep(.asset-preview--thumbnail) {
  height: 100%;
  width: 100%;
  aspect-ratio: auto;
}

.category-actions {
  white-space: nowrap;
}

.category-color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>

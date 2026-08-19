<template>
  <div class="obs-browser-content">
    <v-alert
      v-if="sceneCount === 0"
      type="info"
      variant="tonal"
      density="compact"
      :text="$t('obs.settings.empty')"
    />

    <v-card
      v-else-if="selectedCanvas"
      color="grey-darken-4"
      class="pt-2 obs-page-panel"
      elevation="0"
      rounded="0"
    >
      <v-card-title class="pb-5">
        <div class="d-flex align-center ga-3 w-100">
          <v-select
            v-model="selectedCanvasKey"
            :items="canvasOptions"
            item-title="title"
            item-value="value"
            :label="$t('obs.settings.canvas')"
            density="compact"
            variant="outlined"
            hide-details
            class="flex-grow-1"
          />

          <v-chip size="small" variant="tonal">
            {{ getCanvasScenes(selectedCanvas).length }}
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="getCanvasScenes(selectedCanvas).length === 0"
          type="info"
          variant="tonal"
          density="compact"
          :text="$t('obs.settings.empty')"
        />

        <v-expansion-panels
          v-else
          v-model="expandedScenes"
          multiple
          color="grey-darken-3"
        >
          <v-expansion-panel
            v-for="obsScene in getCanvasScenes(selectedCanvas)"
            :key="getSceneKey(obsScene, selectedCanvas)"
            :value="getSceneKey(obsScene, selectedCanvas)"
            :color="isActiveScene(obsScene) ? 'primary' : undefined"
            :class="{ 'obs-active-scene': isActiveScene(obsScene) }"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                <span class="text-truncate">{{ obsScene.name }}</span>

                <div class="d-flex align-center ga-2">
                  <v-chip
                    v-if="isActiveScene(obsScene)"
                    size="x-small"
                    color="primary"
                    variant="flat"
                  >
                    {{ $t('obs.settings.activeScene') }}
                  </v-chip>

                  <v-chip size="x-small" variant="tonal">
                    {{ getItems(obsScene).length }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="pa-0">
              <div
                v-if="selectedCanvasIndex === 0"
                class="d-flex justify-end pa-3 pb-1"
              >
                <v-btn
                  variant="text"
                  :disabled="isActiveScene(obsScene)"
                  prepend-icon="mdi-video-switch"
                  @click="switchToScene(obsScene, selectedCanvas)"
                >
                  {{ $t('obs.settings.switchTo') }}
                </v-btn>
              </div>

              <v-expansion-panels
                v-if="getItems(obsScene).length > 0"
                v-model="expandedSources"
                multiple
                class="mt-2"
              >
                <v-expansion-panel
                  v-for="obsItem in getItems(obsScene)"
                  :key="getSourceKey(obsItem, obsScene, selectedCanvas)"
                  :value="getSourceKey(obsItem, obsScene, selectedCanvas)"
                  color="grey-darken-4"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                      <div class="d-flex align-center ga-2 min-width-0">
                        <v-icon
                          :icon="getSourceIcon(obsItem)"
                          size="small"
                        />
                        <span class="text-truncate">{{ obsItem.name }}</span>
                      </div>

                      <v-chip
                        size="x-small"
                        :color="isSourceEnabled(obsItem) ? 'primary' : undefined"
                        :variant="isSourceEnabled(obsItem) ? 'flat' : 'tonal'"
                      >
                        {{ isSourceEnabled(obsItem) ? $t('obs.settings.enabled') : $t('obs.settings.disabled') }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text class="pa-0">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-2 pa-3">
                      <v-btn
                        v-if="hasApiWebsite"
                        prepend-icon="mdi-plus"
                        :loading="isAdding(obsItem, obsScene, selectedCanvas)"
                        color="primary"
                        @click="addSource(obsItem, obsScene, selectedCanvas)"
                      >
                        {{ $t('obs.settings.addSource') }}
                      </v-btn>

                      <div v-else />

                      <v-btn
                        :prepend-icon="isSourceEnabled(obsItem) ? 'mdi-eye-off' : 'mdi-eye'"
                        variant="text"
                        :color="isSourceEnabled(obsItem) ? 'error' : 'primary'"
                        @click="setSourceEnabled(
                          obsItem,
                          obsScene,
                          selectedCanvas,
                          !isSourceEnabled(obsItem),
                        )"
                      >
                        {{ isSourceEnabled(obsItem) ? $t('obs.settings.disable') : $t('obs.settings.enable') }}
                      </v-btn>
                    </div>

                    <v-expansion-panels
                      v-if="getFlattenedChildItems(obsItem).length > 0"
                      v-model="expandedChildSources"
                      multiple
                      class="px-3 pb-3"
                    >
                      <v-expansion-panel
                        v-for="childEntry in getFlattenedChildItems(obsItem)"
                        :key="getChildSourceKey(childEntry.item, obsItem)"
                        :value="getChildSourceKey(childEntry.item, obsItem)"
                        color="grey-darken-3"
                        :style="{ marginLeft: `${childEntry.depth * 16}px` }"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                            <div class="d-flex align-center ga-2 min-width-0">
                              <v-icon
                                :icon="getSourceIcon(childEntry.item)"
                                size="small"
                              />
                              <span class="text-truncate">
                                {{ childEntry.item.name }}
                              </span>
                            </div>

                            <v-chip
                              size="x-small"
                              :color="isSourceEnabled(childEntry.item) ? 'primary' : undefined"
                              :variant="isSourceEnabled(childEntry.item) ? 'flat' : 'tonal'"
                            >
                              {{ isSourceEnabled(childEntry.item) ? $t('obs.settings.enabled') : $t('obs.settings.disabled') }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text class="pa-0">
                          <div class="d-flex align-center justify-space-between flex-wrap ga-2 pa-3">
                            <v-btn
                              v-if="hasApiWebsite"
                              prepend-icon="mdi-plus"
                              :loading="isAdding(childEntry.item, obsScene, selectedCanvas)"
                              color="primary"
                              @click.stop="addSource(
                                childEntry.item,
                                obsScene,
                                selectedCanvas,
                              )"
                            >
                              {{ $t('obs.settings.addSource') }}
                            </v-btn>

                            <div v-else />

                            <v-btn
                              :prepend-icon="isSourceEnabled(childEntry.item) ? 'mdi-eye-off' : 'mdi-eye'"
                              variant="text"
                              :color="isSourceEnabled(childEntry.item) ? 'error' : 'primary'"
                              @click.stop="setSourceEnabled(
                                childEntry.item,
                                obsScene,
                                selectedCanvas,
                                !isSourceEnabled(childEntry.item),
                              )"
                            >
                              {{ isSourceEnabled(childEntry.item) ? $t('obs.settings.disable') : $t('obs.settings.enable') }}
                            </v-btn>
                          </div>

                          <v-expansion-panels
                            v-if="getFilters(childEntry.item).length > 0"
                            v-model="expandedFilters"
                            multiple
                            class="px-3 pb-3"
                          >
                            <v-expansion-panel
                              :value="getChildFiltersPanelKey(childEntry.item, obsItem)"
                              color="grey-darken-2"
                            >
                              <v-expansion-panel-title>
                                <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                                  <span>{{ $t('obs.settings.filters') }}</span>

                                  <v-chip size="x-small" variant="tonal">
                                    {{ getFilters(childEntry.item).length }}
                                  </v-chip>
                                </div>
                              </v-expansion-panel-title>

                              <v-expansion-panel-text class="pa-0">
                                <v-list bg-color="transparent" lines="one">
                                  <v-list-item
                                    v-for="filter in getFilters(childEntry.item)"
                                    :key="getFilterKey(filter, childEntry.item)"
                                    :title="getFilterName(filter)"
                                  >
                                    <template #prepend>
                                      <v-icon
                                        icon="mdi-filter-outline"
                                        size="small"
                                      />
                                    </template>

                                    <template #append>
                                      <v-btn
                                        size="small"
                                        :prepend-icon="isFilterEnabled(filter) ? 'mdi-filter-off-outline' : 'mdi-filter-outline'"
                                        variant="text"
                                        :color="isFilterEnabled(filter) ? 'error' : 'primary'"
                                        @click.stop="setFilterEnabled(
                                          childEntry.item,
                                          filter,
                                          !isFilterEnabled(filter),
                                        )"
                                      >
                                        {{ isFilterEnabled(filter) ? $t('obs.settings.disable') : $t('obs.settings.enable') }}
                                      </v-btn>
                                    </template>
                                  </v-list-item>
                                </v-list>
                              </v-expansion-panel-text>
                            </v-expansion-panel>
                          </v-expansion-panels>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>

                    <v-expansion-panels
                      v-if="getFilters(obsItem).length > 0"
                      v-model="expandedFilters"
                      multiple
                      class="px-3 pb-3"
                    >
                      <v-expansion-panel
                        :value="getFiltersPanelKey(obsItem, obsScene, selectedCanvas)"
                        color="grey-darken-3"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                            <span>{{ $t('obs.settings.filters') }}</span>

                            <v-chip size="x-small" variant="tonal">
                              {{ getFilters(obsItem).length }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text class="pa-0">
                          <v-list bg-color="transparent" lines="one">
                            <v-list-item
                              v-for="filter in getFilters(obsItem)"
                              :key="getFilterKey(filter, obsItem)"
                              :title="getFilterName(filter)"
                            >
                              <template #append>
                                <v-btn
                                  size="small"
                                  :prepend-icon="isFilterEnabled(filter) ? 'mdi-filter-off-outline' : 'mdi-filter-outline'"
                                  variant="text"
                                  :color="isFilterEnabled(filter) ? 'error' : 'primary'"
                                  @click.stop="setFilterEnabled(
                                    obsItem,
                                    filter,
                                    !isFilterEnabled(filter),
                                  )"
                                >
                                  {{ isFilterEnabled(filter) ? $t('obs.settings.disable') : $t('obs.settings.enable') }}
                                </v-btn>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </div>
</template>
<script lang="ts">
import { getWebsocketClient } from '@/plugins/websocketInstance'
import { useAppStore } from '@/stores/app'

export default {
  props: {
    connection: {
      type: String,
      default: 'default',
    },
    scenes: {
      type: Array,
      default: () => [],
    },
    currentScene: {
      type: Object,
      default: () => ({}),
    },
    currentSceneUuid: {
      type: String,
      default: '',
    },
    currentSceneName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      addingSources: {} as Record<string, boolean>,
      expandedScenes: [] as string[],
      expandedSources: [] as string[],
      expandedChildSources: [] as string[],
      expandedFilters: [] as string[],
      defaultExpandedSceneKey: null as string | null,
      selectedCanvasKey: '' as string,
    }
  },

  computed: {
    appStore() {
      return useAppStore()
    },

    hasApiWebsite(): boolean {
      return Boolean((this.appStore as any).hasApiWebsite)
    },

    canvases(): any[] {
      const rawScenes = Array.isArray(this.scenes) ? this.scenes as any[] : []

      if(rawScenes.some(entry => this.getCanvasScenes(entry).length > 0)) {
        return rawScenes
      }

      return [{
        name: this.$t ? this.$t('obs.settings.mainCanvas') : 'Main',
        uuid: 'default',
        scenes: rawScenes,
      }]
    },

    sceneCount(): number {
      return this.canvases.reduce(
        (count: number, canvas: any) => count + this.getCanvasScenes(canvas).length,
        0,
      )
    },


    canvasOptions(): Array<{ title: string, value: string }> {
      return this.canvases.map((canvas: any) => ({
        title: this.getCanvasName(canvas),
        value: this.getCanvasKey(canvas),
      }))
    },

    selectedCanvas(): any | null {
      return this.canvases.find(
        (canvas: any) => this.getCanvasKey(canvas) === this.selectedCanvasKey,
      ) ?? this.canvases[0] ?? null
    },

    selectedCanvasIndex(): number {
      if(!this.selectedCanvas) return -1
      return this.canvases.findIndex(
        (canvas: any) => this.getCanvasKey(canvas) === this.getCanvasKey(this.selectedCanvas),
      )
    },
  },

  watch: {
    scenes: {
      handler() {
        this.ensureSelectedCanvas()
        this.expandActiveSceneByDefault()
      },
      deep: true,
      immediate: true,
    },

    currentSceneUuid() {
      this.expandActiveSceneByDefault()
    },

    currentSceneName() {
      this.expandActiveSceneByDefault()
    },


    selectedCanvasKey() {
      this.defaultExpandedSceneKey = null
      this.expandedSources = []
      this.expandedChildSources = []
      this.expandedFilters = []
      this.expandActiveSceneByDefault()
    },
  },

  methods: {
    ensureSelectedCanvas() {
      const selectedExists = this.canvases.some(
        (canvas: any) => this.getCanvasKey(canvas) === this.selectedCanvasKey,
      )

      if(selectedExists) return

      const activeCanvas = this.canvases.find((canvas: any) =>
        this.getCanvasScenes(canvas).some(scene => this.isActiveScene(scene)),
      )

      this.selectedCanvasKey = this.getCanvasKey(activeCanvas ?? this.canvases[0] ?? {})
    },

    getCanvasScenes(canvas: any): any[] {
      return Array.isArray(canvas?.scenes) ? canvas.scenes : []
    },

    getCanvasName(canvas: any): string {
      return String(canvas?.name ?? canvas?.canvasName ?? 'Main')
    },

    getCanvasUuid(canvas: any): string {
      return String(canvas?.uuid ?? canvas?.canvasUuid ?? '')
    },

    getCanvasKey(canvas: any): string {
      return String(this.getCanvasUuid(canvas) || this.getCanvasName(canvas) || canvas?.index || '')
    },

    getItems(scene: any): any[] {
      return Array.isArray(scene?.items) ? scene.items : []
    },

    getChildItems(source: any): any[] {
      return Array.isArray(source?.children) ? source.children : []
    },

    getFlattenedChildItems(source: any): Array<{ item: any, depth: number }> {
      const result: Array<{ item: any, depth: number }> = []

      const walk = (items: any[], depth: number) => {
        for(const item of items) {
          result.push({ item, depth })

          const children = this.getChildItems(item)
          if(children.length > 0) {
            walk(children, depth + 1)
          }
        }
      }

      walk(this.getChildItems(source), 0)

      return result
    },

    getChildSourceKey(source: any, parent: any): string {
      return `${String(parent?.uuid ?? parent?.name ?? '')}:${String(source?.uuid ?? source?.id ?? source?.name ?? '')}:${String(source?.parentSceneName ?? '')}`
    },

    getFilters(source: any): any[] {
      if(Array.isArray(source?.filters)) return source.filters
      if(Array.isArray(source?.sourceFilters)) return source.sourceFilters
      return []
    },

    getSceneKey(scene: any, canvas: any = null): string {
      return `${this.getCanvasKey(canvas)}:${String(scene?.uuid ?? scene?.name ?? scene?.index ?? '')}`
    },

    getSourceKey(source: any, scene: any = null, canvas: any = null): string {
      return `${this.getSceneKey(scene, canvas)}:${String(source?.uuid ?? source?.id ?? source?.name ?? '')}`
    },

    getFiltersPanelKey(source: any, scene: any, canvas: any): string {
      return `${this.getSourceKey(source, scene, canvas)}:filters`
    },

    getChildFiltersPanelKey(source: any, parent: any): string {
      return `${this.getChildSourceKey(source, parent)}:filters`
    },

    getSourceIcon(source: any): string {
      if(source?.isGroup) return 'mdi-folder-outline'

      const kind = String(
        source?.inputKind
        ?? source?.sourceType
        ?? source?.kind
        ?? '',
      ).toLowerCase()

      if(kind.includes('browser')) return 'mdi-web'
      if(kind.includes('image')) return 'mdi-image-outline'
      if(kind.includes('media')) return 'mdi-movie-open-outline'
      if(kind.includes('ffmpeg')) return 'mdi-movie-open-outline'
      if(kind.includes('vlc')) return 'mdi-playlist-play'
      if(kind.includes('text')) return 'mdi-format-text'
      if(kind.includes('audio')) return 'mdi-volume-high'
      if(kind.includes('wasapi')) return 'mdi-volume-high'
      if(kind.includes('pulse')) return 'mdi-volume-high'
      if(kind.includes('alsa')) return 'mdi-volume-high'
      if(kind.includes('capture')) return 'mdi-video-outline'
      if(kind.includes('camera')) return 'mdi-camera-outline'
      if(kind.includes('scene')) return 'mdi-view-dashboard-outline'
      if(kind.includes('color')) return 'mdi-palette-outline'

      return 'mdi-source-branch'
    },

    getFilterName(filter: any): string {
      return String(filter?.filterName ?? filter?.name ?? '')
    },

    getFilterKey(filter: any, source: any): string {
      return `${String(source?.uuid ?? source?.name ?? '')}:${this.getFilterName(filter)}`
    },

    getActiveSceneUuid(): string {
      return String(
        this.currentSceneUuid
        || (this.currentScene as any)?.uuid
        || (this.currentScene as any)?.sceneUuid
        || '',
      )
    },

    getActiveSceneName(): string {
      return String(
        this.currentSceneName
        || (this.currentScene as any)?.name
        || (this.currentScene as any)?.sceneName
        || '',
      )
    },

    isActiveScene(scene: any): boolean {
      if(scene?.active || scene?.current || scene?.isActive || scene?.isCurrentProgramScene) {
        return true
      }

      const activeUuid = this.getActiveSceneUuid()
      if(activeUuid && String(scene?.uuid ?? '') === activeUuid) return true

      const activeName = this.getActiveSceneName()
      return Boolean(activeName && String(scene?.name ?? '') === activeName)
    },

    isSourceEnabled(source: any): boolean {
      return Boolean(source?.sceneItemEnabled ?? source?.enabled ?? false)
    },

    isFilterEnabled(filter: any): boolean {
      return Boolean(filter?.filterEnabled ?? filter?.enabled ?? false)
    },

    findActiveSceneKey(): string | null {
      if(!this.selectedCanvas) return null

      const activeScene = this.getCanvasScenes(this.selectedCanvas)
        .find(scene => this.isActiveScene(scene))

      return activeScene
        ? this.getSceneKey(activeScene, this.selectedCanvas)
        : null
    },

    expandActiveSceneByDefault() {
      const activeSceneKey = this.findActiveSceneKey()

      if(this.defaultExpandedSceneKey === activeSceneKey) return

      this.defaultExpandedSceneKey = activeSceneKey
      this.expandedScenes = activeSceneKey ? [activeSceneKey] : []
      this.expandedSources = []
      this.expandedFilters = []
    },

    sendObsCommand(method: string, data: Record<string, any>) {
      getWebsocketClient()?.send('obs_trigger_command', {
        connection: this.connection,
        obs_id: this.connection,
        method,
        data,
      })
    },

    switchToScene(scene: any, canvas: any) {
      const data: Record<string, any> = {}
      const sceneUuid = String(scene?.uuid ?? scene?.sceneUuid ?? '')
      const sceneName = String(scene?.name ?? scene?.sceneName ?? '')
      const canvasUuid = this.getCanvasUuid(canvas)

      if(sceneUuid) data.sceneUuid = sceneUuid
      else if(sceneName) data.sceneName = sceneName

      if(canvasUuid && canvasUuid !== 'default') {
        data.canvasUuid = canvasUuid
      }

      this.sendObsCommand('SetCurrentProgramScene', data)
    },

    setSourceEnabled(source: any, scene: any, canvas: any, enabled: boolean) {
      const fallbackSceneUuid = String(scene?.uuid ?? scene?.sceneUuid ?? '')
      const fallbackSceneName = String(scene?.name ?? scene?.sceneName ?? '')
      const parentSceneUuid = String(source?.parentSceneUuid ?? '')
      const parentSceneName = String(source?.parentSceneName ?? '')
      const canvasUuid = String(source?.canvasUuid ?? this.getCanvasUuid(canvas) ?? '')
      const sceneItemId = Number(source?.id ?? source?.sceneItemId)

      if(!Number.isFinite(sceneItemId)) return

      const data: Record<string, any> = {
        sceneItemId,
        sceneItemEnabled: enabled,
      }

      if(parentSceneUuid) {
        data.sceneUuid = parentSceneUuid
      } else if(parentSceneName) {
        data.sceneName = parentSceneName
      } else if(fallbackSceneUuid) {
        data.sceneUuid = fallbackSceneUuid
      } else if(fallbackSceneName) {
        data.sceneName = fallbackSceneName
      }

      if(canvasUuid && canvasUuid !== 'default') {
        data.canvasUuid = canvasUuid
      }

      source.sceneItemEnabled = enabled
      source.enabled = enabled

      this.sendObsCommand('SetSceneItemEnabled', data)
    },

    setFilterEnabled(source: any, filter: any, enabled: boolean) {
      const sourceName = String(source?.name ?? source?.sourceName ?? '')
      const filterName = this.getFilterName(filter)

      if(!sourceName || !filterName) return

      filter.filterEnabled = enabled
      filter.enabled = enabled

      this.sendObsCommand('SetSourceFilterEnabled', {
        sourceName,
        filterName,
        filterEnabled: enabled,
      })
    },

    isAdding(source: any, scene: any = null, canvas: any = null): boolean {
      return Boolean(this.addingSources[this.getSourceKey(source, scene, canvas)])
    },

    async addSource(source: any, scene: any = null, canvas: any = null) {
      const uuid = String(source?.uuid ?? '')
      const name = String(source?.name ?? '')

      if(!uuid || !name) return

      const key = this.getSourceKey(source, scene, canvas)
      this.addingSources[key] = true

      try {
        getWebsocketClient()?.send('add_source', {
          name,
          uuid,
          obs_id: this.connection,
        })
      } catch(error) {
        console.warn(error)
      } finally {
        this.addingSources[key] = false
      }
    },
  },
}
</script>

<style scoped>
.min-width-0 {
  min-width: 0;
}

.obs-active-scene :deep(.v-expansion-panel-title) {
  color: rgb(var(--v-theme-on-primary));
}

.obs-browser-content {
  max-height: calc(100vh - 55px);
  overflow-y: auto;
}

.obs-page-panel {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4" class="category-editor-shell">
      <v-toolbar flat density="comfortable" class="category-editor-toolbar">
        <v-toolbar-title class="d-flex align-center min-width-0">
          <v-icon icon="mdi-gamepad-variant-outline" class="mr-2" />
          <div class="min-width-0">
            <div class="text-truncate">
              {{ form.name || $t('categoryLibrary.editor.title') }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              Twitch ID {{ form.category_id || '—' }}
            </div>
          </div>
        </v-toolbar-title>

        <div class="d-none d-md-flex align-center ga-2 mr-2">
          <v-chip
            v-if="form.use_as_media_fallback"
            size="small"
            color="secondary"
            variant="tonal"
            prepend-icon="mdi-backup-restore"
          >
            {{ $t('categoryLibrary.fallback') }}
          </v-chip>

          <v-chip
            v-if="form.custom_media.length"
            size="small"
            variant="tonal"
            prepend-icon="mdi-multimedia"
          >
            {{ form.custom_media.length }}
          </v-chip>

          <v-chip
            v-if="obsFilterCount"
            size="small"
            variant="tonal"
            prepend-icon="mdi-filter-cog-outline"
          >
            {{ obsFilterCount }}
          </v-chip>
        </div>

        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-toolbar>

      <v-tabs
        v-model="activeTab"
        color="primary"
        bg-color="grey-darken-4"
        show-arrows
        class="category-editor-tabs"
      >
        <v-tab value="general" prepend-icon="mdi-information-outline">
          {{ $t('categoryLibrary.editor.tabs.general') }}
        </v-tab>
        <v-tab value="media" prepend-icon="mdi-multimedia">
          {{ $t('categoryLibrary.editor.tabs.media') }}
        </v-tab>
        <v-tab value="channel-points" prepend-icon="mdi-star-circle-outline">
          {{ $t('categoryLibrary.editor.tabs.channelPoints') }}
        </v-tab>
        <v-tab value="obs" prepend-icon="mdi-filter-cog-outline">
          {{ $t('categoryLibrary.editor.tabs.obs') }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <div class="category-editor-content">
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="ma-4 mb-0"
          :text="errorMessage"
        />

        <v-window v-model="activeTab" class="category-editor-window">
          <v-window-item value="general">
            <div class="category-editor-page">
              <v-row density="comfortable">
                <v-col cols="12" xl="7">
                  <v-card color="grey-darken-3" variant="flat" class="h-100">
                    <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                      <v-icon icon="mdi-information-outline" />
                      {{ $t('categoryLibrary.editor.general') }}
                    </v-card-title>

                    <v-card-text>
                      <v-row density="comfortable">
                        <v-col cols="12" lg="8">
                          <v-text-field
                            v-model="form.name"
                            :label="$t('categoryLibrary.editor.name')"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>

                        <v-col cols="12" lg="4">
                          <v-text-field
                            :model-value="form.category_id"
                            :label="$t('categoryLibrary.editor.twitchId')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            readonly
                          />
                        </v-col>

                        <v-col cols="12" lg="6">
                          <v-text-field
                            v-model.number="form.steam_app_id"
                            :label="$t('categoryLibrary.editor.steamAppId')"
                            :hint="$t('categoryLibrary.editor.steamAppIdHint')"
                            persistent-hint
                            type="number"
                            min="1"
                            variant="outlined"
                            density="compact"
                            clearable
                          />
                        </v-col>

                        <v-col cols="12" lg="6">
                          <ColorPickerField
                            v-model="form.theme_color"
                            :label="$t('categoryLibrary.editor.themeColor')"
                            omit-hash
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-card color="grey-darken-4" variant="flat" class="pa-3">
                            <v-switch
                              v-model="form.use_as_media_fallback"
                              color="primary"
                              hide-details
                              :label="$t('categoryLibrary.editor.mediaFallback')"
                            />
                            <div class="text-caption text-medium-emphasis ml-10 mt-1">
                              {{ $t('categoryLibrary.editor.mediaFallbackHint') }}
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" xl="5">
                  <v-card color="grey-darken-3" variant="flat" class="h-100">
                    <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                      <v-icon icon="mdi-information-slab-circle-outline" />
                      {{ $t('categoryLibrary.editor.info') }}
                    </v-card-title>

                    <v-card-text>
                      <div class="category-info-grid">
                        <div class="category-info-item">
                          <span class="text-caption text-medium-emphasis">
                            {{ $t('categoryLibrary.editor.created') }}
                          </span>
                          <strong>{{ formatDate(form.created_at) }}</strong>
                        </div>
                        <div class="category-info-item">
                          <span class="text-caption text-medium-emphasis">
                            {{ $t('categoryLibrary.editor.updated') }}
                          </span>
                          <strong>{{ formatDate(form.updated_at) }}</strong>
                        </div>
                        <div class="category-info-item">
                          <span class="text-caption text-medium-emphasis">
                            {{ $t('categoryLibrary.editor.customMedia') }}
                          </span>
                          <strong>{{ form.custom_media.length }}</strong>
                        </div>
                        <div class="category-info-item">
                          <span class="text-caption text-medium-emphasis">
                            {{ $t('categoryLibrary.editor.obsFilters') }}
                          </span>
                          <strong>{{ obsFilterCount }}</strong>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" xl="8">
                  <v-card color="grey-darken-3" variant="flat">
                    <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                      <v-icon icon="mdi-wallpaper" />
                      {{ $t('categoryLibrary.editor.wallpaper') }}
                    </v-card-title>

                    <v-card-text>
                      <v-row density="comfortable">
                        <v-col cols="12" lg="7">
                          <v-combobox
                            v-model="form.wallpaper_path"
                            :items="mediaSuggestions"
                            :label="$t('categoryLibrary.editor.wallpaperPath')"
                            :hint="$t('categoryLibrary.editor.wallpaperHint')"
                            persistent-hint
                            prepend-inner-icon="mdi-wallpaper"
                            variant="outlined"
                            density="compact"
                            clearable
                            :loading="loadingMedia"
                            :menu-props="{ maxHeight: 320 }"
                            @focus="ensureMediaSuggestions"
                          />

                          <div class="d-flex flex-wrap ga-2 mt-3">
                            <v-btn
                              variant="tonal"
                              color="primary"
                              prepend-icon="mdi-upload"
                              :loading="uploadingTarget === 'wallpaper'"
                              :disabled="Boolean(uploadingTarget)"
                              @click="openUpload('wallpaper')"
                            >
                              {{ $t('categoryLibrary.editor.uploadWallpaper') }}
                            </v-btn>

                            <v-btn
                              v-if="form.wallpaper_path"
                              variant="tonal"
                              prepend-icon="mdi-archive-arrow-down-outline"
                              :loading="compressingPath === form.wallpaper_path"
                              :disabled="Boolean(compressingPath)"
                              @click="compressMedia(form.wallpaper_path)"
                            >
                              {{ $t('categoryLibrary.editor.compress') }}
                            </v-btn>

                            <v-btn
                              v-if="form.wallpaper_path"
                              variant="text"
                              prepend-icon="mdi-restore"
                              @click="form.wallpaper_path = ''"
                            >
                              {{ $t('categoryLibrary.editor.useAutomaticWallpaper') }}
                            </v-btn>
                          </div>
                        </v-col>

                        <v-col cols="12" lg="5">
                          <AssetPreview
                            v-if="form.wallpaper_path"
                            :asset="{ path: form.wallpaper_path, type: 'file' }"
                            :rest-api="restApi"
                            variant="compact"
                            :controls="true"
                            :autoplay="false"
                            :muted="true"
                            class="category-wallpaper-preview"
                          />

                          <v-alert
                            v-else
                            type="info"
                            variant="tonal"
                            density="compact"
                          >
                            {{ $t('categoryLibrary.editor.automaticWallpaper') }}
                          </v-alert>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" xl="4">
                  <v-card color="grey-darken-3" variant="flat" class="h-100">
                    <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                      <v-icon icon="mdi-image-outline" />
                      {{ $t('categoryLibrary.editor.cover') }}
                    </v-card-title>

                    <v-card-text>
                      <AssetPreview
                        v-if="form.cover_path"
                        :asset="{ path: form.cover_path, type: 'file' }"
                        :rest-api="restApi"
                        variant="compact"
                        :controls="false"
                      />
                      <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        density="compact"
                      >
                        {{ $t('categoryLibrary.editor.notFetched') }}
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>

          <v-window-item value="media">
            <div class="category-editor-page">
              <div class="text-body-2 text-medium-emphasis mb-4">
                {{ $t('categoryLibrary.editor.mediaSlotsHint') }}
              </div>

              <v-alert
                v-if="!mediaSlots.length"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                {{ $t('categoryLibrary.editor.noMediaSlots') }}
              </v-alert>

              <v-row v-else density="comfortable">
                <v-col
                  v-for="slot in mediaSlots"
                  :key="slot.name"
                  cols="12"
                  xl="6"
                >
                  <v-card color="grey-darken-3" variant="flat" class="h-100">
                    <v-card-title class="d-flex align-center justify-space-between ga-3">
                      <div class="min-width-0">
                        <div class="text-subtitle-1 text-truncate">{{ slot.name }}</div>
                        <div class="text-caption text-medium-emphasis text-truncate">
                          {{ mediaSlotDescription(slot) }}
                        </div>
                      </div>

                      <v-btn
                        v-if="mediaPathFor(slot.name)"
                        icon="mdi-close"
                        size="small"
                        variant="text"
                        :title="$t('categoryLibrary.editor.clearMedia')"
                        @click="setMediaPath(slot.name, '')"
                      />
                    </v-card-title>

                    <v-card-text>
                      <v-row density="comfortable">
                        <v-col cols="12" lg="7">
                          <v-combobox
                            :model-value="mediaPathFor(slot.name)"
                            :items="mediaSuggestions"
                            :label="$t('categoryLibrary.editor.mediaPath')"
                            prepend-inner-icon="mdi-folder-multimedia"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            :loading="loadingMedia"
                            :menu-props="{ maxHeight: 320 }"
                            @focus="ensureMediaSuggestions"
                            @update:model-value="setMediaPath(slot.name, $event)"
                          />

                          <div class="d-flex flex-wrap ga-2 mt-3">
                            <v-btn
                              variant="tonal"
                              color="primary"
                              prepend-icon="mdi-upload"
                              :loading="uploadingTarget === `slot:${slot.name}`"
                              :disabled="Boolean(uploadingTarget)"
                              @click="openUpload(`slot:${slot.name}`)"
                            >
                              {{ $t('categoryLibrary.editor.uploadMedia') }}
                            </v-btn>

                            <v-btn
                              v-if="mediaPathFor(slot.name)"
                              variant="tonal"
                              prepend-icon="mdi-archive-arrow-down-outline"
                              :loading="compressingPath === mediaPathFor(slot.name)"
                              :disabled="Boolean(compressingPath)"
                              @click="compressMedia(mediaPathFor(slot.name))"
                            >
                              {{ $t('categoryLibrary.editor.compress') }}
                            </v-btn>
                          </div>
                        </v-col>

                        <v-col cols="12" lg="5">
                          <AssetPreview
                            v-if="mediaPathFor(slot.name)"
                            :asset="{ path: mediaPathFor(slot.name), type: 'file' }"
                            :rest-api="restApi"
                            variant="compact"
                            :controls="true"
                            :autoplay="false"
                            :muted="true"
                            class="category-selected-preview"
                          />

                          <div
                            v-else
                            class="category-selected-preview category-selected-preview--empty"
                          >
                            <v-icon icon="mdi-image-outline" size="40" />
                            <span class="text-caption">
                              {{ $t('categoryLibrary.editor.noMediaSelected') }}
                            </span>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>

          <v-window-item value="channel-points">
            <div class="category-editor-page">
              <v-card color="grey-darken-3" variant="flat">
                <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                  <v-icon icon="mdi-star-circle-outline" />
                  {{ $t('categoryLibrary.editor.channelPoints') }}
                </v-card-title>

                <v-card-text>
                  <div class="text-body-2 text-medium-emphasis mb-4">
                    {{ $t('categoryLibrary.editor.channelPointsHint') }}
                  </div>

                  <v-row density="comfortable">
                    <v-col cols="12" xl="6">
                      <v-card color="grey-darken-4" variant="flat" class="pa-4 h-100">
                        <v-autocomplete
                          v-model="form.channel_points"
                          :items="availableChannelPoints"
                          item-title="title"
                          item-value="value"
                          :label="$t('categoryLibrary.editor.enabledChannelPoints')"
                          :hint="$t('categoryLibrary.editor.enabledChannelPointsHint')"
                          persistent-hint
                          multiple
                          chips
                          closable-chips
                          clearable
                          variant="outlined"
                          density="compact"
                        >
                          <template #chip="{ props, item }">
                            <v-chip
                              v-bind="props"
                              color="primary"
                              variant="tonal"
                            >
                              {{ item.title }}
                            </v-chip>
                          </template>

                          <template #item="{ props, item }">
                            <v-list-item v-bind="props">
                              <template #append>
                                <v-chip
                                  v-if="item.raw.defaultEnabled"
                                  size="x-small"
                                  variant="tonal"
                                >
                                  {{ $t('categoryLibrary.editor.defaultEnabled') }}
                                </v-chip>
                              </template>
                            </v-list-item>
                          </template>
                        </v-autocomplete>
                      </v-card>
                    </v-col>

                    <v-col cols="12" xl="6">
                      <v-card color="grey-darken-4" variant="flat" class="pa-4 h-100">
                        <v-autocomplete
                          v-model="form.blocked_channel_points"
                          :items="availableChannelPoints"
                          item-title="title"
                          item-value="value"
                          :label="$t('categoryLibrary.editor.blockedChannelPoints')"
                          :hint="$t('categoryLibrary.editor.blockedChannelPointsHint')"
                          persistent-hint
                          multiple
                          chips
                          closable-chips
                          clearable
                          variant="outlined"
                          density="compact"
                        >
                          <template #chip="{ props, item }">
                            <v-chip
                              v-bind="props"
                              color="error"
                              variant="tonal"
                            >
                              {{ item.title }}
                            </v-chip>
                          </template>
                        </v-autocomplete>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-alert
                    v-if="channelPointConflicts.length"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mt-4"
                  >
                    {{ $t('categoryLibrary.editor.channelPointConflict', {
                      names: channelPointConflicts.join(', '),
                    }) }}
                  </v-alert>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>

          <v-window-item value="obs">
            <div class="category-editor-page">
              <v-row density="comfortable">
                <v-col cols="12" xl="8">
                  <v-card color="grey-darken-3" variant="flat">
                    <v-card-title class="d-flex align-center justify-space-between ga-2">
                      <div class="d-flex align-center ga-2">
                        <v-icon icon="mdi-filter-cog-outline" />
                        <span class="text-subtitle-1">
                          {{ $t('categoryLibrary.editor.obsFilters') }}
                        </span>
                      </div>

                      <v-chip size="small" variant="tonal">
                        {{ obsFilterCount }}
                      </v-chip>
                    </v-card-title>

                    <v-card-text>
                      <div class="text-body-2 text-medium-emphasis mb-3">
                        {{ $t('categoryLibrary.editor.obsFiltersHint') }}
                      </div>

                      <div class="d-flex flex-wrap ga-2 mb-4">
                        <v-btn
                          color="primary"
                          variant="tonal"
                          prepend-icon="mdi-content-save-cog-outline"
                          :disabled="!currentObsSourceCount || !fallbackObsFilterCount"
                          @click="saveCurrentObsStateFromFallback"
                        >
                          {{ $t('categoryLibrary.editor.saveCurrentObsState') }}
                        </v-btn>

                        <v-btn
                          v-if="obsFilterCount"
                          color="error"
                          variant="text"
                          prepend-icon="mdi-delete-outline"
                          @click="clearObsFilters"
                        >
                          {{ $t('categoryLibrary.editor.clearObsFilters') }}
                        </v-btn>
                      </div>

                      <v-alert
                        v-if="!obsFilterSources.length"
                        type="info"
                        variant="tonal"
                        density="compact"
                      >
                        {{ $t('categoryLibrary.editor.noObsFilters') }}
                      </v-alert>

                      <v-expansion-panels
                        v-else
                        multiple
                        variant="accordion"
                        class="category-filter-preview"
                      >
                        <v-expansion-panel
                          v-for="source in obsFilterSources"
                          :key="source.uuid"
                          color="grey-darken-4"
                        >
                          <v-expansion-panel-title>
                            <div class="d-flex align-center justify-space-between w-100 pr-3 ga-3">
                              <div class="d-flex align-center ga-2 min-width-0">
                                <v-icon icon="mdi-source-branch" size="small" />
                                <div class="min-width-0">
                                  <div class="text-body-2 text-truncate">
                                    {{ source.name }}
                                  </div>
                                  <div class="text-caption text-medium-emphasis text-truncate">
                                    {{ source.obsId }} · {{ source.uuid }}
                                  </div>
                                </div>
                              </div>

                              <v-chip size="x-small" variant="tonal">
                                {{ source.filters.length }}
                              </v-chip>
                            </div>
                          </v-expansion-panel-title>

                          <v-expansion-panel-text>
                            <v-list
                              v-if="source.filters.length"
                              bg-color="transparent"
                              density="compact"
                              lines="two"
                            >
                              <v-list-item
                                v-for="filter in source.filters"
                                :key="`${source.uuid}:${filter.name}`"
                              >
                                <template #prepend>
                                  <v-icon
                                    :icon="filter.name.startsWith('Source|') ? 'mdi-vector-square' : 'mdi-filter-outline'"
                                    size="small"
                                  />
                                </template>

                                <v-list-item-title>
                                  {{ filter.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                  {{ filterSummary(filter) }}
                                </v-list-item-subtitle>

                                <template #append>
                                  <v-chip size="x-small" variant="outlined">
                                    #{{ filter.index }}
                                  </v-chip>
                                </template>
                              </v-list-item>
                            </v-list>

                            <v-alert
                              v-else
                              type="info"
                              variant="tonal"
                              density="compact"
                            >
                              {{ $t('categoryLibrary.editor.noSourceFilters') }}
                            </v-alert>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>

                      <v-expansion-panels variant="accordion" class="mt-4">
                        <v-expansion-panel color="grey-darken-4">
                          <v-expansion-panel-title>
                            <div class="d-flex align-center ga-2">
                              <v-icon icon="mdi-code-json" size="small" />
                              {{ $t('categoryLibrary.editor.advancedObsFilters') }}
                            </div>
                          </v-expansion-panel-title>

                          <v-expansion-panel-text>
                            <v-textarea
                              v-model="obsFiltersJson"
                              :label="$t('categoryLibrary.editor.obsFiltersJson')"
                              :hint="$t('categoryLibrary.editor.obsFiltersJsonHint')"
                              :error-messages="obsFiltersError ? [obsFiltersError] : []"
                              persistent-hint
                              variant="outlined"
                              rows="12"
                              auto-grow
                              class="category-json-editor"
                              @blur="syncObsFiltersFromJson"
                            />
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" xl="4">
                  <v-card color="grey-darken-3" variant="flat" class="h-100">
                    <v-card-title class="text-subtitle-1 d-flex align-center ga-2">
                      <v-icon icon="mdi-language-css3" />
                      {{ $t('categoryLibrary.editor.customCss') }}
                    </v-card-title>

                    <v-card-text>
                      <v-textarea
                        v-model="form.custom_css"
                        :label="$t('categoryLibrary.editor.customCss')"
                        :hint="$t('categoryLibrary.editor.customCssHint')"
                        persistent-hint
                        variant="outlined"
                        rows="18"
                        auto-grow
                        class="category-css-editor"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>
        </v-window>
      </div>

      <v-divider />

      <v-card-actions class="category-editor-actions">
        <v-btn
          color="secondary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="refreshing"
          @click="$emit('refresh', form.category_id)"
        >
          {{ $t('categoryLibrary.refresh') }}
        </v-btn>

        <v-spacer />

        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="!canSave"
          @click="submit"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>

      <input
        ref="categoryMediaUploadInput"
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime,video/x-matroska"
        style="display: none"
        @change="handleDirectUpload"
      />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import AssetPreview from '@/components/AssetPreview.vue'
import ColorPickerField from '@/components/inputs/ColorPickerField.vue'
import { getWebsocketClient } from '@/plugins/websocketInstance'


export default {
  name: 'CategoryLibraryEditorDialog',

  components: {
    AssetPreview,
    ColorPickerField,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    category: { type: Object, default: null },
    restApi: { type: String, required: true },
    saving: { type: Boolean, default: false },
    refreshing: { type: Boolean, default: false },
    mediaSlots: { type: Array, default: () => [] },
    currentObsFilters: { type: Object, default: () => ({}) },
    currentObsSources: { type: Object, default: () => ({}) },
    fallbackObsFilters: { type: Object, default: () => ({}) },
    availableChannelPoints: { type: Array, default: () => [] },
  },

  emits: ['update:modelValue', 'save', 'refresh'],

  data() {
    return {
      errorMessage: '',
      loadingMedia: false,
      mediaLoaded: false,
      mediaSuggestions: [] as string[],
      uploadingTarget: '',
      compressingPath: '',
      obsFiltersJson: '{}',
      obsFiltersError: '',
      activeTab: 'general',
      form: this.emptyForm(),
    }
  },

  computed: {
    canSave(): boolean {
      return Boolean(String(this.form.category_id ?? '').trim() && String(this.form.name ?? '').trim() && !this.obsFiltersError)
    },

    channelPointConflicts(): string[] {
      const enabled = new Set(
        (this.form.channel_points ?? []).map((name: string) => String(name).trim().toLowerCase()),
      )

      return (this.form.blocked_channel_points ?? [])
        .filter((name: string) => enabled.has(String(name).trim().toLowerCase()))
    },

    obsFilterCount(): number {
      return Object.keys(this.form.obs_filters ?? {}).length
    },

    currentObsSourceCount(): number {
      return Object.keys(this.currentObsSources ?? {}).length
    },

    fallbackObsFilterCount(): number {
      return Object.keys(this.fallbackObsFilters ?? {}).length
    },

    obsFilterSources(): any[] {
      const filters = this.form.obs_filters ?? {}

      return Object.entries(filters).map(([uuid, source]: [string, any]) => {
        const reserved = new Set(['name', 'obs_id', 'obsId', 'filters'])
        const nestedFilters = source?.filters && typeof source.filters === 'object'
          ? source.filters
          : null

        const rawFilters = nestedFilters ?? Object.fromEntries(
          Object.entries(source ?? {}).filter(([key]) => !reserved.has(key)),
        )

        const list = Object.entries(rawFilters ?? {}).map(([name, filter]: [string, any]) => ({
          name,
          index: Number(filter?.index ?? filter?.sourceIndex ?? 0),
          config: filter?.config ?? {},
        }))

        return {
          uuid,
          name: String(source?.name ?? uuid),
          obsId: String(source?.obs_id ?? source?.obsId ?? 'default'),
          filters: list.sort((a, b) => a.index - b.index || a.name.localeCompare(b.name)),
        }
      }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }))
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(open: boolean) {
        if (!open) return
        this.activeTab = 'general'
        this.resetFromCategory()
      },
    },

    category: {
      deep: true,
      handler() {
        if (this.modelValue) this.resetFromCategory()
      },
    },
  },

  methods: {
    emptyForm() {
      return {
        category_id: '',
        name: '',
        cover_path: '',
        cover_url: '',
        steam_app_id: null as number | null,
        wallpaper_path: '',
        wallpaper_url: '',
        theme_color: '',
        custom_css: '',
        obs_filters: {} as Record<string, any>,
        channel_points: [] as string[],
        blocked_channel_points: [] as string[],
        custom_media: [] as Array<{ name: string; path: string }>,
        use_as_media_fallback: false,
        created_at: '',
        updated_at: '',
      }
    },

    resetFromCategory() {
      const value: any = this.category ?? {}
      this.errorMessage = ''
      this.obsFiltersError = ''
      this.form = {
        ...this.emptyForm(),
        ...JSON.parse(JSON.stringify(value)),
        steam_app_id: value?.steam_app_id ?? null,
        wallpaper_path: String(value?.wallpaper_path ?? value?.steam_wallpaper_path ?? ''),
        wallpaper_url: String(value?.wallpaper_url ?? value?.steam_wallpaper_url ?? ''),
        theme_color: String(value?.theme_color ?? ''),
        custom_css: String(value?.custom_css ?? ''),
        obs_filters: value?.obs_filters && typeof value.obs_filters === 'object' && !Array.isArray(value.obs_filters)
          ? JSON.parse(JSON.stringify(value.obs_filters))
          : {},
        channel_points: Array.isArray(value?.channel_points)
          ? value.channel_points
              .map((point: any) => String(typeof point === 'string' ? point : point?.name ?? point?.label ?? '').trim())
              .filter(Boolean)
          : [],
        blocked_channel_points: Array.isArray(value?.blocked_channel_points)
          ? value.blocked_channel_points
              .map((point: any) => String(typeof point === 'string' ? point : point?.name ?? point?.label ?? '').trim())
              .filter(Boolean)
          : [],
        custom_media: Array.isArray(value?.custom_media)
          ? value.custom_media
              .map((media: any) => {
                if (typeof media === 'string') return { name: media, path: '' }
                return {
                  name: String(media?.name ?? media?.target ?? media?.orientation ?? '').trim(),
                  path: String(media?.path ?? '').trim(),
                }
              })
              .filter((media: any) => media.name)
          : [],
        use_as_media_fallback: value?.use_as_media_fallback === true,
      }
      this.obsFiltersJson = JSON.stringify(this.form.obs_filters ?? {}, null, 2)
    },

    filterSummary(filter: any): string {
      const config = filter?.config
      if (!config || typeof config !== 'object') return String(config ?? '')

      const keys = Object.keys(config)
      if (!keys.length) return String(this.$t('categoryLibrary.editor.emptyFilterConfig'))

      const important = keys.slice(0, 3).map(key => {
        const value = config[key]
        if (typeof value === 'object') return `${key}: …`
        return `${key}: ${String(value)}`
      })

      return important.join(' · ') + (keys.length > 3 ? ` · +${keys.length - 3}` : '')
    },

    getLiveSourceFilters(source: any): any[] {
      if (Array.isArray(source?.filters)) return source.filters
      if (Array.isArray(source?.sourceFilters)) return source.sourceFilters
      return []
    },

    getLiveFilterName(filter: any): string {
      return String(filter?.filterName ?? filter?.name ?? filter?.sourceFilterName ?? '').trim()
    },

    getLiveFilterSettings(filter: any): any {
      return filter?.filterSettings ?? filter?.settings ?? filter?.config ?? {}
    },

    getLiveFilterIndex(filter: any): number {
      const value = Number(filter?.filterIndex ?? filter?.index ?? filter?.sourceIndex ?? 0)
      return Number.isFinite(value) ? value : 0
    },

    getFallbackSourceFilters(source: any): Record<string, any> {
      if (!source || typeof source !== 'object') return {}

      if (source.filters && typeof source.filters === 'object' && !Array.isArray(source.filters)) {
        return source.filters
      }

      return Object.fromEntries(
        Object.entries(source).filter(
          ([key]) => !['name', 'obs_id', 'obsId', 'filters'].includes(key),
        ),
      )
    },

    saveCurrentObsStateFromFallback() {
      const fallback = this.fallbackObsFilters ?? {}
      const updated: Record<string, any> = {}

      for (const [sourceUuid, fallbackSource] of Object.entries(fallback) as Array<[string, any]>) {
        const liveSource = (this.currentObsSources as any)?.[sourceUuid]
        if (!liveSource) continue

        const fallbackFilters = this.getFallbackSourceFilters(fallbackSource)
        const liveFilters = new Map(
          this.getLiveSourceFilters(liveSource)
            .map((filter: any) => [this.getLiveFilterName(filter), filter])
            .filter(([name]: [string, any]) => Boolean(name)),
        )

        const filters: Record<string, any> = {}

        for (const [filterId, fallbackFilter] of Object.entries(fallbackFilters) as Array<[string, any]>) {
          if (filterId === 'Source|Transform') {
            const transform = liveSource?.transform ?? liveSource?.sceneItemTransform
            if (!transform || typeof transform !== 'object') continue

            filters[filterId] = {
              ...JSON.parse(JSON.stringify(fallbackFilter ?? {})),
              config: JSON.parse(JSON.stringify(transform)),
            }
            continue
          }

          const liveFilter = liveFilters.get(filterId)
          if (!liveFilter) continue

          const liveIndex = this.getLiveFilterIndex(liveFilter)

          filters[filterId] = {
            ...JSON.parse(JSON.stringify(fallbackFilter ?? {})),
            index: liveIndex,
            sourceIndex: liveIndex,
            config: JSON.parse(JSON.stringify(this.getLiveFilterSettings(liveFilter))),
          }
        }

        if (!Object.keys(filters).length) continue

        updated[sourceUuid] = {
          ...JSON.parse(JSON.stringify(fallbackSource ?? {})),
          name: String(
            fallbackSource?.name ??
            liveSource?.name ??
            liveSource?.sourceName ??
            sourceUuid
          ),
          obs_id: String(
            fallbackSource?.obs_id ??
            fallbackSource?.obsId ??
            liveSource?.obs_id ??
            liveSource?.obsId ??
            'default'
          ),
          filters,
        }
      }

      this.form.obs_filters = updated
      this.obsFiltersJson = JSON.stringify(updated, null, 2)
      this.obsFiltersError = ''

      this.errorMessage = Object.keys(updated).length
        ? ''
        : String(this.$t('categoryLibrary.editor.noMatchingFallbackFilters'))
    },

    clearObsFilters() {
      this.form.obs_filters = {}
      this.obsFiltersJson = '{}'
      this.obsFiltersError = ''
    },

    syncObsFiltersFromJson() {
      try {
        const parsed = JSON.parse(String(this.obsFiltersJson || '{}'))
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error(String(this.$t('categoryLibrary.editor.obsFiltersObjectRequired')))
        }
        this.form.obs_filters = parsed
        this.obsFiltersJson = JSON.stringify(parsed, null, 2)
        this.obsFiltersError = ''
      } catch (error: any) {
        this.obsFiltersError = error?.message ?? String(this.$t('categoryLibrary.editor.obsFiltersInvalid'))
      }
    },

    openUpload(target: string) {
      if (this.uploadingTarget) return

      this.uploadingTarget = target
      const input = this.$refs.categoryMediaUploadInput as HTMLInputElement | undefined

      if (!input) {
        this.uploadingTarget = ''
        return
      }

      input.value = ''
      input.click()
    },

    async handleDirectUpload(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input?.files?.[0]
      const target = this.uploadingTarget

      if (!file || !target) {
        this.uploadingTarget = ''
        return
      }

      try {
        const categoryId = String(this.form.category_id ?? '').trim()
        const uploadPath = categoryId ? `category_library/${categoryId}` : 'category_library'
        const formData = new FormData()

        formData.append('path', uploadPath)
        formData.append('files', file, file.name)

        const response = await fetch(`${this.restApi}/api/assets/media/upload`, {
          method: 'POST',
          body: formData,
        })

        const body = await response.json().catch(() => ({}))
        const data = body?.data ?? body

        if (!response.ok || data?.error || body?.error) {
          throw new Error(
            data?.message ??
            body?.message ??
            body?.error ??
            `upload failed (${response.status})`
          )
        }

        const added = Array.isArray(data?.added) ? data.added : []
        const uploadedPath = String(added[0] ?? `${uploadPath}/${file.name}`)
          .replace(/\\/g, '/')
          .replace(/^\/+/, '')

        if (target === 'wallpaper') {
          this.form.wallpaper_path = uploadedPath
        } else if (target.startsWith('slot:')) {
          this.setMediaPath(target.slice(5), uploadedPath)
        }

        this.mediaLoaded = false
        await this.ensureMediaSuggestions()
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'upload failed'
      } finally {
        this.uploadingTarget = ''
        if (input) input.value = ''
      }
    },

    async compressMedia(path: string) {
      const normalizedPath = this.normalizePath(path)
      if (!normalizedPath || this.compressingPath) return

      this.compressingPath = normalizedPath

      try {
        const client: any = getWebsocketClient()
        if (!client?.request) throw new Error('websocket is not connected')

        const response = await client.request('media_compress', {
          path: normalizedPath,
        }, 120_000)

        const params = response?.params ?? response
        const data = params?.result_media_compress ?? params?.data ?? params

        if (data?.error) throw new Error(data.error)
      } catch (error: any) {
        this.errorMessage = error?.message ?? 'compress failed'
      } finally {
        this.compressingPath = ''
      }
    },

    mediaSlotDescription(slot: any): string {
      const parts = [
        slot?.target ? `${this.$t('categoryLibrary.editor.target')}: ${slot.target}` : '',
        slot?.orientation ? String(this.$t(`categoryLibrary.orientation.${slot.orientation}`)) : '',
      ].filter(Boolean)
      return parts.join(' · ')
    },

    mediaPathFor(name: string): string {
      const media = this.form.custom_media.find((item: any) => item.name === name)
      return String(media?.path ?? '')
    },

    setMediaPath(name: string, value: any) {
      const normalizedName = String(name ?? '').trim()
      if (!normalizedName) return

      const path = this.normalizePath(value)
      const index = this.form.custom_media.findIndex((item: any) => item.name === normalizedName)

      if (!path) {
        if (index >= 0) this.form.custom_media.splice(index, 1)
        return
      }

      if (index >= 0) {
        this.form.custom_media[index].path = path
      } else {
        this.form.custom_media.push({ name: normalizedName, path })
      }
    },

    normalizePath(value: any): string {
      return String(value ?? '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/')
    },

    isSupportedMedia(path: string): boolean {
      return /\.(?:avif|bmp|gif|jpe?g|png|webp|mp4|webm|mov|mkv)$/i.test(path)
    },

    getMediaEntries(response: any): any[] {
      const params = response?.params ?? response
      const data = params?.result_media_list ?? params?.data ?? params
      if (Array.isArray(data?.files)) return data.files
      if (Array.isArray(data?.items)) return data.items
      if (Array.isArray(data?.entries)) return data.entries
      if (Array.isArray(data?.children)) return data.children
      return []
    },

    async ensureMediaSuggestions() {
      if (this.mediaLoaded || this.loadingMedia) return
      const client: any = getWebsocketClient()
      if (!client?.request) return

      this.loadingMedia = true
      try {
        const found = new Set<string>()
        const visited = new Set<string>()
        const pending: Array<{ path: string; depth: number }> = [{ path: '', depth: 0 }]

        const worker = async () => {
          while (pending.length) {
            const item = pending.shift()
            if (!item || item.depth > 8) continue

            const base = this.normalizePath(item.path)
            if (visited.has(base)) continue
            visited.add(base)

            const response = await client.request('media_list', { path: base }, 15_000)
            for (const entry of this.getMediaEntries(response)) {
              const entryName = String(entry?.name ?? '').trim()
              const path = this.normalizePath(entry?.path || [base, entryName].filter(Boolean).join('/'))
              if (!path) continue

              if (entry?.type === 'folder' || entry?.isDirectory === true) {
                pending.push({ path, depth: item.depth + 1 })
              } else if (this.isSupportedMedia(path)) {
                found.add(path)
              }
            }
          }
        }

        await Promise.all(Array.from({ length: 4 }, () => worker()))
        this.mediaSuggestions = Array.from(found).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }),
        )
        this.mediaLoaded = true
      } catch (error) {
        console.warn('loading category media suggestions failed', error)
      } finally {
        this.loadingMedia = false
      }
    },

    submit() {
      this.syncObsFiltersFromJson()
      if (!this.canSave) return

      const category = {
        ...this.form,
        category_id: String(this.form.category_id),
        name: String(this.form.name).trim(),
        steam_app_id: Number(this.form.steam_app_id) > 0 ? Number(this.form.steam_app_id) : undefined,
        wallpaper_path: this.normalizePath(this.form.wallpaper_path) || undefined,
        theme_color: String(this.form.theme_color ?? '').replace(/^#/, '').trim() || undefined,
        custom_css: String(this.form.custom_css ?? ''),
        obs_filters: JSON.parse(JSON.stringify(this.form.obs_filters ?? {})),
        channel_points: Array.from(new Set(
          (this.form.channel_points ?? []).map((name: string) => String(name).trim()).filter(Boolean),
        )),
        blocked_channel_points: Array.from(new Set(
          (this.form.blocked_channel_points ?? []).map((name: string) => String(name).trim()).filter(Boolean),
        )),
        custom_media: this.form.custom_media
          .map((media: any) => ({
            name: String(media?.name ?? '').trim(),
            path: this.normalizePath(media?.path),
          }))
          .filter((media: any) => media.name && media.path),
        use_as_media_fallback: Boolean(this.form.use_as_media_fallback),
      }

      this.$emit('save', category)
    },

    formatDate(value: any): string {
      const date = new Date(String(value ?? ''))
      if (Number.isNaN(date.getTime())) return '—'
      return date.toLocaleString()
    },
  },
}
</script>

<style scoped>
.category-media-row {
  border: 1px solid rgba(var(--v-theme-on-surface), .12);
  border-radius: 8px;
  background: rgba(0, 0, 0, .12);
}

.category-media-slot {
  border: 1px solid rgba(var(--v-theme-on-surface), .12);
  border-radius: 8px;
  background: rgba(0, 0, 0, .12);
}

.category-selected-preview {
  min-height: 180px;
}

.category-selected-preview--empty {
  border: 1px dashed rgba(var(--v-theme-on-surface), .18);
  border-radius: 8px;
  color: rgba(var(--v-theme-on-surface), .5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.category-css-editor :deep(textarea),
.category-json-editor :deep(textarea) {
  font-family: "Ubuntu Mono", "Fira Code", monospace;
}


.category-editor-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-editor-toolbar,
.category-editor-tabs,
.category-editor-actions {
  flex: 0 0 auto;
}

.category-editor-tabs {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.category-editor-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.category-editor-window {
  min-height: 100%;
}

.category-editor-page {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

.category-editor-actions {
  min-height: 60px;
  padding-inline: 16px;
  background: rgb(var(--v-theme-surface));
}

.category-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.category-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, .16);
}

.category-wallpaper-preview {
  min-height: 220px;
}

@media (max-width: 959px) {
  .category-editor-page {
    padding: 12px;
  }

  .category-editor-actions {
    padding-inline: 8px;
  }

  .category-info-grid {
    grid-template-columns: 1fr;
  }
}

</style>

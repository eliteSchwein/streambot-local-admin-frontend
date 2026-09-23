<template>
  <v-card class="overflow-auto mx-auto" max-height="100%" elevation="0" color="transparent" max-width="100%">
    <v-card-title class="d-flex align-center justify-space-between px-3 pt-3">
      <div class="d-flex align-center ga-2 min-width-0">
        <v-icon icon="mdi-cog" />
        <div class="min-width-0">
          <div class="text-truncate">{{ $t('settings.title') }}</div>
        </div>
      </div>

    </v-card-title>

    <v-card-text>

      <v-alert
        v-if="errorMessage"
        type="error"
        color="red-darken-3"
        class="mb-4"
        :text="errorMessage"
      />

      <v-row density="compact" align="start">
        <v-col cols="12" md="6" lg="4" class="d-flex flex-column">
          <v-card color="grey-darken-4" elevation="0" class="mb-2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-translate" />
              <span>{{ $t('settings.language') }}</span>
            </v-card-title>

            <v-card-text>
              <v-select
                :disabled="settingsLocked"
                v-model="form.language"
                :items="languageItems"
                item-title="title"
                item-value="value"
                :label="$t('settings.language')"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0" class="mb-2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-palette" />
              <span>{{ $t('settings.theme') }}</span>
            </v-card-title>

            <v-card-text>
              <v-sheet color="grey-darken-3" rounded class="pa-3 mb-3">
                <div class="text-caption text-grey-lighten-1 mb-1">
                  {{ $t('settings.themeDefaultPrimaryColor') }}
                </div>

                <div class="d-flex align-center ga-3 min-width-0">
                  <div
                    class="settings-color-preview settings-color-preview--large"
                    :style="{ backgroundColor: normalizedDefaultColorPreview }"
                  />

                  <div class="min-width-0">
                    <div class="text-body-2 text-truncate">{{ normalizedDefaultColorPreview }}</div>
                    <div class="text-caption text-grey-lighten-1">
                      {{ $t('settings.themeDefaultPrimaryColorHint') }}
                    </div>
                  </div>
                </div>
              </v-sheet>

              <ColorPickerField
                v-model="form.theme.default_color"
                :disabled="settingsLocked"
                :label="$t('settings.themeHexColor')"
                omit-hash
              />
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0" class="mb-2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-monitor-dashboard" />
              <span>{{ $t('settings.touchDisplay') }}</span>
            </v-card-title>

            <v-card-text>
              <v-combobox
                v-model="form.touch_wallpaper"
                :items="touchWallpaperItems"
                :label="$t('settings.touchWallpaper')"
                :hint="$t('settings.touchWallpaperHint')"
                prepend-inner-icon="mdi-wallpaper"
                variant="outlined"
                density="comfortable"
                clearable
                persistent-hint
                :loading="loadingTouchWallpapers"
                :disabled="settingsLocked"
                :menu-props="{ maxHeight: 360 }"
              />
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-account-voice" />
                <span>{{ $t('settings.tts') }}</span>
              </div>

              <v-switch
                v-model="form.tts.enabled"
                color="primary"
                density="compact"
                hide-details
                :disabled="settingsLocked"
              />
            </v-card-title>

            <v-card-text class="pt-2">

              <v-alert
                type="warning"
                variant="tonal"
                density="comfortable"
                class="mb-4"
                :text="$t('settings.ttsWarning')"
              />

              <div v-if="configuredTtsModels.length" class="mb-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="text-subtitle-2">{{ $t('settings.configuredTtsLocales') }}</div>
                  <v-chip size="x-small" variant="tonal">{{ configuredTtsModels.length }}</v-chip>
                </div>

                <v-list bg-color="grey-darken-3" density="compact" rounded class="py-0">
                  <v-list-item
                    v-for="model in configuredTtsModels"
                    :key="`${model.locale}:${model.voice}`"
                    class="tts-model-row"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-account-voice" color="success" class="mr-3" />
                    </template>

                    <v-list-item-title class="text-body-2 text-truncate">
                      {{ model.voice }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ model.locale }}</v-list-item-subtitle>

                    <template #append>
                      <v-btn
                        :disabled="settingsLocked || !form.tts.enabled"
                        icon="mdi-delete-outline"
                        size="small"
                        variant="text"
                        color="red-lighten-2"
                        @click="removeVoice(model.locale, model.voice)"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <v-alert
                v-else
                type="info"
                variant="tonal"
                density="comfortable"
                class="mb-3"
                :text="$t('settings.noConfiguredTtsLocales')"
              />

              <v-text-field
                :disabled="settingsLocked || !form.tts.enabled"
                v-model="voiceSearch"
                :label="$t('settings.searchVoiceModel')"
                prepend-inner-icon="mdi-magnify"
                :append-inner-icon="showVoicePicker ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                class="mb-3"
                @focus="showVoicePicker = true"
                @click="showVoicePicker = true"
                @click:append-inner="showVoicePicker = !showVoicePicker"
              />

              <v-expand-transition>
                <div v-show="showVoicePicker">
                  <v-expansion-panels
                    v-if="filteredVoiceLanguages.length"
                    variant="accordion"
                    color="grey-darken-3"
                  >
                    <v-expansion-panel
                      v-for="language in filteredVoiceLanguages"
                      :key="language"
                    >
                      <v-expansion-panel-title>
                        <div class="d-flex align-center justify-space-between w-100 pr-3">
                          <span>{{ language }}</span>
                          <v-chip size="x-small" variant="tonal">
                            {{ filteredVoicesByLanguage[language].length }}
                          </v-chip>
                        </div>
                      </v-expansion-panel-title>

                      <v-expansion-panel-text class="pa-0">
                        <v-list bg-color="grey-darken-4" density="compact" class="py-0">
                          <v-list-item
                            v-for="voice in filteredVoicesByLanguage[language]"
                            :key="voice"
                            :disabled="settingsLocked"
                            :active="isVoiceSelected(language, voice)"
                            rounded="0"
                            @click="selectVoice(language, voice)"
                          >
                            <template #prepend>
                              <v-icon
                                :icon="isVoiceSelected(language, voice) ? 'mdi-check-circle' : 'mdi-download'"
                                :color="isVoiceSelected(language, voice) ? 'success' : undefined"
                              />
                            </template>
                            <v-list-item-title class="text-truncate">{{ voice }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <v-alert
                    v-else
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    :text="$t('settings.noVoiceModelsFound')"
                  />
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="8">
          <v-card color="grey-darken-4" elevation="0" class="mb-2">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-gamepad-variant-outline" />
                <span>{{ $t('settings.categoryLibrary.title') }}</span>
              </div>

              <v-switch
                v-model="form.category_library.enabled"
                color="primary"
                density="compact"
                hide-details
                :disabled="settingsLocked"
              />
            </v-card-title>

            <v-card-text class="pt-2">
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ $t('settings.categoryLibrary.description') }}
              </div>

              <v-row density="compact">
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.auto_create"
                    :label="$t('settings.categoryLibrary.autoCreate')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.fetch_cover"
                    :label="$t('settings.categoryLibrary.fetchCover')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.fetch_steam_wallpaper"
                    :label="$t('settings.categoryLibrary.fetchSteamWallpaper')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.auto_theme_color"
                    :label="$t('settings.categoryLibrary.autoThemeColor')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.apply_theme_color"
                    :label="$t('settings.categoryLibrary.applyThemeColor')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.apply_media"
                    :label="$t('settings.categoryLibrary.applyMedia')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.apply_custom_css"
                    :label="$t('settings.categoryLibrary.applyCustomCss')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.apply_obs_filters"
                    :label="$t('settings.categoryLibrary.applyObsFilters')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.category_library.apply_channel_points"
                    :label="$t('settings.categoryLibrary.applyChannelPoints')"
                    color="primary"
                    hide-details
                    :disabled="settingsLocked || !form.category_library.enabled"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-tune" />
              <span>{{ $t('settings.assetTune') }}</span>
            </v-card-title>

            <v-card-text>
              <v-row density="compact">
                <v-col cols="12" md="6">
                  <v-select
                    :disabled="settingsLocked"
                    v-model="form.asset_tune.codec"
                    :items="codecItems"
                    :label="$t('settings.videoCodec')"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    :disabled="settingsLocked"
                    v-model.number="form.asset_tune.image_compress_level"
                    :label="$t('settings.imageCompressionLevel')"
                    type="number"
                    min="0"
                    max="6"
                    step="1"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    :disabled="settingsLocked"
                    v-model.number="form.asset_tune.image_compress_percent"
                    :label="$t('settings.imageQualityPercent')"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    :disabled="settingsLocked"
                    v-model="form.asset_tune.auto_compress_upload"
                    :label="$t('settings.autoCompressUpload')"
                    color="primary"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0" class="mt-2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-gift-outline" />
              <span>{{ $t('settings.giveaway') }}</span>
            </v-card-title>

            <v-card-text>
              <v-row density="compact">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.giveaway.giveawayCommand"
                    :disabled="settingsLocked"
                    :loading="giveawayCommandChecking"
                    :label="$t('settings.giveawayCommand')"
                    :hint="$t('settings.giveawayCommandHint')"
                    :error-messages="giveawayCommandErrors"
                    prefix="!"
                    variant="outlined"
                    density="comfortable"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.giveaway.progress_interval_seconds"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayProgressInterval')"
                    :hint="$t('settings.giveawayProgressIntervalHint')"
                    type="number"
                    min="0"
                    step="1"
                    suffix="s"
                    variant="outlined"
                    density="comfortable"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-1" />
                  <div class="text-subtitle-2 mt-3 mb-1">{{ $t('settings.giveawayRequirements') }}</div>
                  <div class="text-caption text-grey-lighten-1 mb-2">{{ $t('settings.giveawayRequirementsHint') }}</div>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="form.giveaway.require_follower"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayRequireFollower')"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.giveaway.minimum_follow_seconds"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayMinimumFollowTime')"
                    :hint="$t('settings.giveawayMinimumFollowTimeHint')"
                    type="number"
                    min="0"
                    step="1"
                    suffix="s"
                    variant="outlined"
                    density="comfortable"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-switch
                    v-model="form.giveaway.require_subscriber"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayRequireSubscriber')"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-switch
                    v-model="form.giveaway.require_vip"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayRequireVip')"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-switch
                    v-model="form.giveaway.require_moderator"
                    :disabled="settingsLocked"
                    :label="$t('settings.giveawayRequireModerator')"
                    color="primary"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card color="grey-darken-4" elevation="0" class="mt-2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-chart-bar" />
              <span>{{ $t('settings.cava') }}</span>
            </v-card-title>

            <v-card-text>
              <v-row density="compact">
                <v-col cols="12" md="6">
                  <v-text-field
                    :disabled="settingsLocked"
                    v-model.number="form.cava.bars"
                    :label="$t('settings.cavaBars')"
                    type="number"
                    min="1"
                    max="512"
                    step="1"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="d-flex align-center justify-space-between ga-2 mb-3">
                <div>
                  <div class="text-subtitle-2">{{ $t('settings.cavaTargets') }}</div>
                  <div class="text-caption text-grey-lighten-1">
                    {{ $t('settings.cavaTargetsHint') }}
                  </div>
                </div>
              </div>

              <v-sheet color="grey-darken-3" rounded class="pa-3 mb-3">
                <v-row density="compact" align="center">
                  <v-col cols="12" md="5">
                    <v-text-field
                      :disabled="settingsLocked"
                      v-model="newCavaTargetName"
                      :label="$t('settings.cavaTargetName')"
                      placeholder="jukebox"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      :disabled="settingsLocked"
                      v-model.number="newCavaTargetBars"
                      :label="$t('settings.cavaBars')"
                      type="number"
                      min="1"
                      max="512"
                      step="1"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-btn
                      :disabled="settingsLocked"
                      block
                      prepend-icon="mdi-plus"
                      color="primary"
                      variant="tonal"
                      @click="addCavaTarget"
                    >
                      {{ $t('common.add') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-sheet>

              <v-expansion-panels
                v-if="cavaTargetNames.length"
                variant="accordion"
                class="mb-3"
              >
                <v-expansion-panel
                  :disabled="settingsLocked"
                  v-for="targetName in cavaTargetNames"
                  :key="targetName"
                  color="grey-darken-3"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center ga-2 min-width-0 w-100">
                      <v-icon icon="mdi-chart-bar" size="small" />
                      <span class="text-truncate">cava {{ targetName }}</span>
                      <v-spacer />
                      <v-chip size="small" variant="tonal">
                        {{ form.cava.targets[targetName]?.bars || 36 }} bars
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <v-row density="compact">
                      <v-col cols="12" md="6">
                        <v-text-field
                          :disabled="settingsLocked"
                          v-model.number="form.cava.targets[targetName].bars"
                          :label="$t('settings.cavaBars')"
                          type="number"
                          min="1"
                          max="512"
                          step="1"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-switch
                          :disabled="settingsLocked"
                          v-model="form.cava.targets[targetName].enabled"
                          :label="$t('common.enabled')"
                          color="primary"
                          inset
                          hide-details
                        />
                      </v-col>
                    </v-row>

                    <v-table density="compact" class="bg-transparent mt-2">
                      <tbody>
                      <tr
                        v-for="settingKey in cavaTargetSettingKeys(targetName)"
                        :key="`${targetName}-${settingKey}`"
                      >
                        <td class="text-caption text-grey-lighten-1" style="width: 38%">{{ settingKey }}</td>
                        <td>
                          <v-text-field
                            :disabled="settingsLocked"
                            v-model="form.cava.targets[targetName][settingKey]"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </td>
                        <td class="text-right" style="width: 48px">
                          <v-btn
                            :disabled="settingsLocked"
                            icon="mdi-delete"
                            size="small"
                            variant="text"
                            color="red-lighten-2"
                            @click="removeCavaTargetSetting(targetName, settingKey)"
                          />
                        </td>
                      </tr>
                      </tbody>
                    </v-table>

                    <v-row density="compact" align="center" class="mt-2">
                      <v-col cols="12" md="5">
                        <v-text-field
                          :disabled="settingsLocked"
                          v-model="newCavaTargetSettings[targetName].key"
                          :label="$t('settings.cavaSettingKey')"
                          placeholder="framerate"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="12" md="5">
                        <v-text-field
                          :disabled="settingsLocked"
                          v-model="newCavaTargetSettings[targetName].value"
                          :label="$t('settings.cavaSettingValue')"
                          placeholder="60"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="12" md="2">
                        <v-btn
                          :disabled="settingsLocked"
                          block
                          prepend-icon="mdi-plus"
                          variant="tonal"
                          @click="addCavaTargetSetting(targetName)"
                        >
                          {{ $t('common.add') }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-3">
                      <v-btn
                        :disabled="settingsLocked"
                        prepend-icon="mdi-delete"
                        color="red-lighten-2"
                        variant="text"
                        @click="removeCavaTarget(targetName)"
                      >
                        {{ $t('common.delete') }}
                      </v-btn>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import ColorPickerField from '@/components/inputs/ColorPickerField.vue'
import { checkNameExistsResult } from '@/helper/NameExistsHelper'

type SettingsForm = {
  language: string
  touch_wallpaper: string
  asset_tune: {
    codec: string
    auto_compress_upload: boolean
    image_compress_level: number
    image_compress_percent: number
  }
  tts: {
    enabled: boolean
    voices: Record<string, string[]>
  }
  theme: {
    default_color: string
  }
  category_library: {
    enabled: boolean
    auto_create: boolean
    fetch_cover: boolean
    fetch_steam_wallpaper: boolean
    auto_theme_color: boolean
    apply_theme_color: boolean
    apply_media: boolean
    apply_custom_css: boolean
    apply_obs_filters: boolean
    apply_channel_points: boolean
  }
  giveaway: {
    giveawayCommand: string
    progress_interval_seconds: number
    require_follower: boolean
    minimum_follow_seconds: number
    require_subscriber: boolean
    require_vip: boolean
    require_moderator: boolean
  }
  cava: {
    bars: number
    input: {
      source: string
    }
    output: {
      channels: string
    }
    targets: Record<string, Record<string, any>>
  }
}

const defaultForm = (): SettingsForm => ({
  language: 'en',
  touch_wallpaper: '',
  asset_tune: {
    codec: 'vp9',
    auto_compress_upload: false,
    image_compress_level: 6,
    image_compress_percent: 80,
  },
  tts: {
    enabled: false,
    voices: {},
  },
  theme: {
    default_color: 'ff9800',
  },
  category_library: {
    enabled: false,
    auto_create: true,
    fetch_cover: true,
    fetch_steam_wallpaper: true,
    auto_theme_color: true,
    apply_theme_color: true,
    apply_media: true,
    apply_custom_css: true,
    apply_obs_filters: true,
    apply_channel_points: true,
  },
  giveaway: {
    giveawayCommand: 'ticket',
    progress_interval_seconds: 60,
    require_follower: false,
    minimum_follow_seconds: 0,
    require_subscriber: false,
    require_vip: false,
    require_moderator: false,
  },
  cava: {
    bars: 36,
    input: {
      source: 'streambot_cava.monitor',
    },
    output: {
      channels: 'mono',
    },
    targets: {},
  },
})

export default {
  name: 'Settings',

  components: {
    ColorPickerField,
  },

  data() {
    return {
      saving: false,
      errorMessage: '',
      autoSaveTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      syncingFromStore: false,
      waitingForReload: false,
      lastSavedSnapshot: '',
      form: defaultForm(),
      voiceSearch: '',
      showVoicePicker: false,
      touchWallpaperItems: [] as string[],
      loadingTouchWallpapers: false,
      touchWallpapersLoaded: false,
      giveawayCommandCheckTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      giveawayCommandChecking: false,
      giveawayCommandExists: false,
      giveawayCommandConflictName: '',
      savedGiveawayCommand: 'ticket',
      newCavaTargetName: '',
      newCavaTargetBars: 63,
      newCavaTargetSettings: {} as Record<string, { key: string, value: string }>,
      languageItems: [
        { title: 'English', value: 'en' },
        { title: 'Deutsch', value: 'de' },
      ],
      codecItems: [
        { title: 'VP9', value: 'vp9' },
        { title: 'AV1', value: 'av1' },
      ],
    }
  },

  computed: {
    ...mapState(useAppStore, ['settings', 'getVoices', 'getReloadUpdate']),

    reloadFinished(): boolean {
      return (this as any).getReloadUpdate?.finished === true
    },

    settingsLocked(): boolean {
      return Boolean(
        (this as any).saving ||
        (this as any).waitingForReload ||
        !(this as any).reloadFinished
      )
    },

    normalizedDefaultColorPreview(): string {
      return `#${(this as any).normalizeHexColor((this as any).form?.theme?.default_color || 'ff9800')}`
    },

    giveawayCommandErrors(): string[] {
      const command = (this as any).normalizeGiveawayCommand((this as any).form?.giveaway?.giveawayCommand)
      if (!command) return [String((this as any).$t('settings.giveawayCommandRequired'))]
      if (!(this as any).giveawayCommandExists) return []

      const owner = String((this as any).giveawayCommandConflictName || command)
      return [String((this as any).$t('settings.giveawayCommandExists', { command: owner }))]
    },

    normalizedVoicesByLanguage(): Record<string, string[]> {
      const voices: Record<string, string[]> = (this as any).getVoices || {}
      const normalized: Record<string, string[]> = {}

      for (const language of Object.keys(voices).sort()) {
        const voiceList = Array.from(new Set([...(voices[language] || [])]))
          .filter(Boolean)
          .sort((a, b) => String(a).localeCompare(String(b)))

        if (voiceList.length) {
          normalized[language] = voiceList
        }
      }

      return normalized
    },

    filteredVoicesByLanguage(): Record<string, string[]> {
      const query = String((this as any).voiceSearch || '').trim().toLowerCase()
      const grouped: Record<string, string[]> = {}

      for (const language of Object.keys((this as any).normalizedVoicesByLanguage).sort()) {
        const voices = (this as any).normalizedVoicesByLanguage[language] || []
        const filteredVoices = query
          ? voices.filter((voice: string) => `${language} ${voice}`.toLowerCase().includes(query))
          : voices

        if (filteredVoices.length) {
          grouped[language] = filteredVoices
        }
      }

      return grouped
    },

    cavaTargetNames(): string[] {
      return Object.keys((this as any).form?.cava?.targets || {}).sort()
    },

    filteredVoiceLanguages(): string[] {
      return Object.keys((this as any).filteredVoicesByLanguage).sort()
    },

    configuredTtsModels(): Array<{ locale: string, voice: string }> {
      const configured = (this as any).form?.tts?.voices ?? {}
      const models: Array<{ locale: string, voice: string }> = []

      for (const locale of Object.keys(configured).sort()) {
        const voices = Array.isArray(configured[locale]) ? configured[locale] : [configured[locale]]

        for (const voice of voices) {
          const normalizedVoice = String(voice ?? '').trim()
          if (normalizedVoice) models.push({ locale, voice: normalizedVoice })
        }
      }

      return models.sort((a, b) =>
        a.locale.localeCompare(b.locale) || a.voice.localeCompare(b.voice)
      )
    },
  },

  watch: {
    settings: {
      immediate: true,
      deep: true,
      handler() {
        this.syncFromStore()
      },
    },

    'form.giveaway.giveawayCommand'(value: string) {
      if (this.syncingFromStore) return
      this.scheduleGiveawayCommandValidation(value)
    },

    form: {
      deep: true,
      handler() {
        if (this.syncingFromStore || this.settingsLocked) return
        if (this.giveawayCommandChecking || this.giveawayCommandExists || !this.normalizeGiveawayCommand(this.form.giveaway.giveawayCommand)) return

        const snapshot = this.getFormSnapshot()
        if (snapshot === this.lastSavedSnapshot) return

        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer)
        }

        this.autoSaveTimer = setTimeout(() => {
          this.autoSaveTimer = undefined

          if (this.getFormSnapshot() === this.lastSavedSnapshot) return

          void this.saveSettings()
        }, 500)
      },
    },

    reloadFinished(finished: boolean) {
      if (finished && this.waitingForReload) {
        this.waitingForReload = false
      }
    },
  },

  mounted() {
    // Prime wallpaper suggestions once in the background. The combobox then
    // only filters the cached local list while the user types.
    void this.ensureTouchWallpaperItems()
  },

  beforeUnmount() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }
    if (this.giveawayCommandCheckTimer) {
      clearTimeout(this.giveawayCommandCheckTimer)
    }
  },

  methods: {
    normalizeGiveawayCommand(value: any): string {
      return String(value ?? '').trim().replace(/^!+/, '').toLowerCase()
    },

    scheduleGiveawayCommandValidation(value: any) {
      if (this.giveawayCommandCheckTimer) clearTimeout(this.giveawayCommandCheckTimer)
      this.giveawayCommandExists = false
      this.giveawayCommandConflictName = ''

      const command = this.normalizeGiveawayCommand(value)
      if (!command || command === this.savedGiveawayCommand) return

      this.giveawayCommandCheckTimer = setTimeout(() => {
        this.giveawayCommandCheckTimer = undefined
        void this.validateGiveawayCommand(command)
      }, 220)
    },

    async validateGiveawayCommand(value: any = this.form.giveaway.giveawayCommand): Promise<boolean> {
      const command = this.normalizeGiveawayCommand(value)
      if (!command) {
        this.giveawayCommandExists = false
        this.giveawayCommandConflictName = ''
        return false
      }

      if (command === this.savedGiveawayCommand) {
        this.giveawayCommandExists = false
        this.giveawayCommandConflictName = ''
        return true
      }

      this.giveawayCommandChecking = true
      try {
        const result = await checkNameExistsResult('commands_exists', command)
        if (command !== this.normalizeGiveawayCommand(this.form.giveaway.giveawayCommand)) return false
        this.giveawayCommandExists = result.exists === true
        this.giveawayCommandConflictName = String(result.command_name ?? result.name ?? command)
        return !this.giveawayCommandExists
      } catch (error: any) {
        console.warn('giveaway command validation failed', error)
        this.errorMessage = error?.message || String(this.$t('settings.giveawayCommandCheckFailed'))
        return false
      } finally {
        this.giveawayCommandChecking = false
      }
    },

    isVoiceSelected(locale: string, voice: string): boolean {
      const configured = this.form.tts.voices?.[locale]
      const voices = Array.isArray(configured) ? configured : configured ? [configured] : []
      return voices.includes(voice)
    },

    selectVoice(locale: string, voice: string) {
      if (this.settingsLocked || this.isVoiceSelected(locale, voice)) return

      const configured = this.form.tts.voices?.[locale]
      const voices = Array.isArray(configured) ? [...configured] : configured ? [configured] : []

      this.form.tts.voices = {
        ...(this.form.tts.voices || {}),
        [locale]: [...voices, voice],
      }
    },

    removeVoice(locale: string, voice: string) {
      if (this.settingsLocked) return

      const configured = this.form.tts.voices?.[locale]
      const voices = (Array.isArray(configured) ? configured : configured ? [configured] : [])
        .filter((configuredVoice: string) => configuredVoice !== voice)

      const next = {...(this.form.tts.voices || {})}

      if (voices.length) next[locale] = voices
      else delete next[locale]

      this.form.tts.voices = next
    },

    syncFromStore() {
      this.syncingFromStore = true

      const defaults = defaultForm()
      const settings: any = this.settings || {}
      const assetTune = settings.asset_tune || {}
      const tts = settings.tts || {}
      const theme = settings.theme || {}
      const categoryLibrary = settings.category_library || {}
      const giveaway = settings.giveaway || {}
      const { command: legacyGiveawayCommand, ...giveawaySettings } = giveaway
      const cava = settings.cava || {}

      this.savedGiveawayCommand = this.normalizeGiveawayCommand(giveaway.giveawayCommand ?? legacyGiveawayCommand ?? defaults.giveaway.giveawayCommand)
      this.giveawayCommandExists = false
      this.giveawayCommandConflictName = ''

      this.form = {
        ...defaults,
        ...settings,
        language: settings.language || defaults.language,
        touch_wallpaper: String(settings.touch_wallpaper ?? defaults.touch_wallpaper),
        asset_tune: {
          ...defaults.asset_tune,
          ...assetTune,
        },
        tts: {
          enabled: tts.enabled === true,
          voices: tts.voices && typeof tts.voices === 'object' && !Array.isArray(tts.voices)
            ? Object.fromEntries(
              Object.entries(tts.voices)
                .map(([locale, value]: [string, any]) => [
                  locale,
                  (Array.isArray(value) ? value : [value])
                    .map((voice: any) => String(voice ?? '').trim())
                    .filter(Boolean),
                ])
                .filter(([, voices]: [string, any]) => voices.length)
            )
            : {},
        },
        theme: {
          ...defaults.theme,
          ...theme,
          default_color: this.normalizeHexColor(theme.default_color || defaults.theme.default_color),
        },
        category_library: {
          ...defaults.category_library,
          ...categoryLibrary,
          enabled: categoryLibrary.enabled === true,
          auto_create: categoryLibrary.auto_create !== false,
          fetch_cover: categoryLibrary.fetch_cover !== false,
          fetch_steam_wallpaper: categoryLibrary.fetch_steam_wallpaper !== false,
          auto_theme_color: categoryLibrary.auto_theme_color !== false,
          apply_theme_color: categoryLibrary.apply_theme_color !== false,
          apply_media: categoryLibrary.apply_media !== false,
          apply_custom_css: categoryLibrary.apply_custom_css !== false,
          apply_obs_filters: categoryLibrary.apply_obs_filters !== false,
          apply_channel_points: categoryLibrary.apply_channel_points !== false,
        },
        giveaway: {
          ...defaults.giveaway,
          ...giveawaySettings,
          giveawayCommand: this.normalizeGiveawayCommand(giveaway.giveawayCommand ?? legacyGiveawayCommand ?? defaults.giveaway.giveawayCommand),
          progress_interval_seconds: Math.max(0, Math.floor(this.normalizeNumber(giveaway.progress_interval_seconds, defaults.giveaway.progress_interval_seconds))),
          require_follower: giveaway.require_follower === true,
          minimum_follow_seconds: Math.max(0, Math.floor(this.normalizeNumber(giveaway.minimum_follow_seconds, defaults.giveaway.minimum_follow_seconds))),
          require_subscriber: giveaway.require_subscriber === true,
          require_vip: giveaway.require_vip === true,
          require_moderator: giveaway.require_moderator === true,
        },
        cava: {
          ...defaults.cava,
          ...cava,
          bars: this.normalizeNumber(cava.bars, defaults.cava.bars),
          input: {
            ...defaults.cava.input,
            ...(cava.input || {}),
          },
          output: {
            ...defaults.cava.output,
            ...(cava.output || {}),
          },
          targets: {
            ...defaults.cava.targets,
            ...(cava.targets || {}),
          },
        },
      }

      this.ensureCavaTargetSettingDrafts()

      this.$nextTick(() => {
        this.lastSavedSnapshot = this.getFormSnapshot()
        this.syncingFromStore = false
      })
    },


    getFormSnapshot(): string {
      return JSON.stringify(this.normalizeForm())
    },

    normalizeCavaValue(value: any) {
      if (typeof value === 'boolean' || typeof value === 'number') return value

      const raw = String(value ?? '').trim()
      const normalized = raw.toLowerCase()

      if (['true', '1', 'yes', 'on'].includes(normalized)) return true
      if (['false', '0', 'no', 'off'].includes(normalized)) return false

      const numericValue = Number(raw)

      return raw !== '' && Number.isFinite(numericValue) ? numericValue : raw
    },

    normalizeCavaTargetName(value: string) {
      return String(value || '')
        .replace(/^cava\s+/i, '')
        .trim()
        .replace(/\s+/g, '_')
    },

    ensureCavaTargetSettingDrafts() {
      for (const targetName of Object.keys(this.form.cava.targets || {})) {
        if (!this.newCavaTargetSettings[targetName]) {
          this.newCavaTargetSettings[targetName] = { key: '', value: '' }
        }
      }
    },

    addCavaTarget() {
      if (this.settingsLocked) return
      const targetName = this.normalizeCavaTargetName(this.newCavaTargetName)

      if (!targetName || targetName === 'default') return

      this.form.cava.targets = {
        ...(this.form.cava.targets || {}),
        [targetName]: {
          bars: this.normalizeNumber(this.newCavaTargetBars, 63),
          enabled: true,
          ...(this.form.cava.targets?.[targetName] || {}),
        },
      }

      this.newCavaTargetSettings[targetName] = { key: '', value: '' }
      this.newCavaTargetName = ''
      this.newCavaTargetBars = 63
    },

    removeCavaTarget(targetName: string) {
      if (this.settingsLocked) return
      const targets = { ...(this.form.cava.targets || {}) }
      delete targets[targetName]
      this.form.cava.targets = targets
      delete this.newCavaTargetSettings[targetName]
    },

    cavaTargetSettingKeys(targetName: string) {
      return Object.keys(this.form.cava.targets?.[targetName] || {})
        .filter(key => !['bars', 'enabled'].includes(key))
        .sort()
    },

    addCavaTargetSetting(targetName: string) {
      if (this.settingsLocked) return
      const draft = this.newCavaTargetSettings[targetName] || { key: '', value: '' }
      const key = String(draft.key || '').trim()

      if (!key || ['bars', 'enabled'].includes(key)) return

      this.form.cava.targets[targetName] = {
        ...(this.form.cava.targets[targetName] || {}),
        [key]: this.normalizeCavaValue(draft.value),
      }

      this.newCavaTargetSettings[targetName] = { key: '', value: '' }
    },

    removeCavaTargetSetting(targetName: string, settingKey: string) {
      if (this.settingsLocked) return
      const target = { ...(this.form.cava.targets?.[targetName] || {}) }
      delete target[settingKey]
      this.form.cava.targets[targetName] = target
    },

    normalizeMediaPath(value: any): string {
      return String(value ?? '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/')
    },

    isWallpaperImage(path: string): boolean {
      return /\.(?:avif|bmp|gif|jpe?g|png|webp)$/i.test(path)
    },

    getMediaListEntries(response: any): any[] {
      const data = response?.params
        ?? this.unwrapWebsocketResponse(response, 'media_list')
        ?? response?.data
        ?? response

      if (Array.isArray(data?.files)) return data.files
      if (Array.isArray(data?.items)) return data.items
      if (Array.isArray(data?.entries)) return data.entries
      if (Array.isArray(data?.children)) return data.children
      return []
    },

    async ensureTouchWallpaperItems() {
      if (this.touchWallpapersLoaded || this.loadingTouchWallpapers) return

      this.loadingTouchWallpapers = true

      try {
        const found = new Set<string>()
        const visited = new Set<string>()
        const pending: Array<{ path: string; depth: number }> = [{ path: '', depth: 0 }]
        const maxDepth = 8
        const workerCount = 4

        const current = String(this.form.touch_wallpaper ?? '').trim()
        if (current) found.add(current)

        const worker = async () => {
          while (pending.length) {
            const next = pending.shift()
            if (!next) return

            const normalizedPath = this.normalizeMediaPath(next.path)
            if (visited.has(normalizedPath) || next.depth > maxDepth) continue
            visited.add(normalizedPath)

            const response = await this.requestWebsocket('media_list', { path: normalizedPath }, 15_000)
            const files = this.getMediaListEntries(response)

            for (const entry of files) {
              const name = String(entry?.name ?? '').trim()
              const entryPath = this.normalizeMediaPath(
                entry?.path || [normalizedPath, name].filter(Boolean).join('/')
              )

              if (!entryPath) continue

              if (entry?.type === 'folder' || entry?.isDirectory === true) {
                pending.push({ path: entryPath, depth: next.depth + 1 })
              } else if (this.isWallpaperImage(entryPath)) {
                found.add(`/${entryPath}`)
              }
            }
          }
        }

        await Promise.all(Array.from({ length: workerCount }, () => worker()))

        this.touchWallpaperItems = Array.from(found).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
        )
        this.touchWallpapersLoaded = true
      } catch (error) {
        console.error('loading touch wallpaper suggestions failed', error)
      } finally {
        this.loadingTouchWallpapers = false
      }
    },

    requestWebsocket(method: string, params: Record<string, any> = {}, timeout = 8_000): Promise<any> {
      const client: any = getWebsocketClient()

      if (!client) {
        return Promise.reject(new Error('websocket is not connected'))
      }

      if (typeof client.request === 'function') {
        return client.request(method, params, timeout)
      }

      return new Promise((resolve, reject) => {
        if (typeof client.send !== 'function') {
          reject(new Error('websocket client does not support send/request'))
          return
        }

        client.send(method, params)
        resolve({ params })
      })
    },

    getWebsocketResultKey(method: string) {
      return `result_${String(method ?? '').replace(/[^a-zA-Z0-9_]/g, '_')}`
    },

    unwrapWebsocketResponse(response: any, method = ''): any {
      const resultKey = method ? this.getWebsocketResultKey(method) : ''
      const containers = [response, response?.data, response?.payload, response?.result, response?.params].filter(Boolean)

      if (resultKey) {
        for (const container of containers) {
          if (container && typeof container === 'object' && Object.prototype.hasOwnProperty.call(container, resultKey)) {
            return container[resultKey]
          }
        }
      }

      for (const container of containers) {
        if (container && typeof container === 'object') {
          if (Object.prototype.hasOwnProperty.call(container, 'settings')) return container.settings
          if (Object.prototype.hasOwnProperty.call(container, 'data')) return container.data
          if (Object.prototype.hasOwnProperty.call(container, 'result')) return container.result
          if (Object.prototype.hasOwnProperty.call(container, 'payload')) return container.payload
        }
      }

      return response
    },

    normalizeHexColor(value: string) {
      const color = String(value || 'ff9800')
        .replace(/^#/, '')
        .replace(/[^0-9a-f]/gi, '')
        .trim()
        .toLowerCase()

      if (/^[0-9a-f]{3}$/i.test(color) || /^[0-9a-f]{6}$/i.test(color)) {
        return color
      }

      return 'ff9800'
    },

    normalizeNumber(value: any, fallback: number) {
      const number = Number(value)

      return Number.isFinite(number) ? number : fallback
    },

    normalizeForm(): SettingsForm {
      const defaults = defaultForm()

      return {
        language: String(this.form.language || defaults.language).trim().toLowerCase(),
        touch_wallpaper: String(this.form.touch_wallpaper ?? '').trim(),
        asset_tune: {
          codec: String(this.form.asset_tune.codec || defaults.asset_tune.codec).trim().toLowerCase(),
          auto_compress_upload: Boolean(this.form.asset_tune.auto_compress_upload),
          image_compress_level: Number(this.form.asset_tune.image_compress_level),
          image_compress_percent: Number(this.form.asset_tune.image_compress_percent),
        },
        tts: {
          enabled: Boolean(this.form.tts.enabled),
          voices: Object.fromEntries(
            Object.entries(this.form.tts.voices || {})
              .map(([locale, value]: [string, any]) => [
                String(locale).trim(),
                (Array.isArray(value) ? value : [value])
                  .map((voice: any) => String(voice ?? '').trim())
                  .filter(Boolean),
              ])
              .filter(([locale, voices]: [string, any]) => Boolean(locale) && voices.length)
          ),
        },
        theme: {
          default_color: this.normalizeHexColor(this.form.theme.default_color || defaults.theme.default_color),
        },
        category_library: {
          enabled: Boolean(this.form.category_library.enabled),
          auto_create: Boolean(this.form.category_library.auto_create),
          fetch_cover: Boolean(this.form.category_library.fetch_cover),
          fetch_steam_wallpaper: Boolean(this.form.category_library.fetch_steam_wallpaper),
          auto_theme_color: Boolean(this.form.category_library.auto_theme_color),
          apply_theme_color: Boolean(this.form.category_library.apply_theme_color),
          apply_media: Boolean(this.form.category_library.apply_media),
          apply_custom_css: Boolean(this.form.category_library.apply_custom_css),
          apply_obs_filters: Boolean(this.form.category_library.apply_obs_filters),
          apply_channel_points: Boolean(this.form.category_library.apply_channel_points),
        },
        giveaway: {
          giveawayCommand: this.normalizeGiveawayCommand(this.form.giveaway.giveawayCommand) || defaults.giveaway.giveawayCommand,
          progress_interval_seconds: Math.max(0, Math.floor(this.normalizeNumber(this.form.giveaway.progress_interval_seconds, defaults.giveaway.progress_interval_seconds))),
          require_follower: Boolean(this.form.giveaway.require_follower),
          minimum_follow_seconds: Math.max(0, Math.floor(this.normalizeNumber(this.form.giveaway.minimum_follow_seconds, defaults.giveaway.minimum_follow_seconds))),
          require_subscriber: Boolean(this.form.giveaway.require_subscriber),
          require_vip: Boolean(this.form.giveaway.require_vip),
          require_moderator: Boolean(this.form.giveaway.require_moderator),
        },
        cava: {
          ...defaults.cava,
          ...this.form.cava,
          bars: this.normalizeNumber(this.form.cava.bars, defaults.cava.bars),
          input: {
            ...defaults.cava.input,
            ...(this.form.cava.input || {}),
          },
          output: {
            ...defaults.cava.output,
            ...(this.form.cava.output || {}),
          },
          targets: Object.fromEntries(
            Object.entries(this.form.cava.targets || {})
              .map(([targetName, targetConfig]: [string, any]) => [
                this.normalizeCavaTargetName(targetName),
                {
                  ...targetConfig,
                  bars: this.normalizeNumber(targetConfig?.bars, defaults.cava.bars),
                  enabled: targetConfig?.enabled !== false,
                },
              ])
              .filter(([targetName]) => targetName && targetName !== 'default'),
          ),
        },
      }
    },

    requiresBackendReload(settings: SettingsForm): boolean {
      if (!this.lastSavedSnapshot) return true

      try {
        const previous = JSON.parse(this.lastSavedSnapshot)
        const current = JSON.parse(JSON.stringify(settings))

        delete previous.tts
        delete current.tts
        delete previous.touch_wallpaper
        delete current.touch_wallpaper

        return JSON.stringify(previous) !== JSON.stringify(current)
      } catch {
        return true
      }
    },

    async saveSettings() {
      const commandValid = await this.validateGiveawayCommand()
      if (!commandValid) return

      this.saving = true
      this.showThemeColorPicker = false
      this.errorMessage = ''

      try {
        const settings = this.normalizeForm()
        const waitForReload = this.requiresBackendReload(settings)
        this.waitingForReload = waitForReload

        const response = await this.requestWebsocket('settings_save', settings)
        const savedSettings = this.unwrapWebsocketResponse(response, 'settings_save') || settings

        if (savedSettings?.error) {
          throw new Error(savedSettings.error)
        }

        this.lastSavedSnapshot = this.getFormSnapshot()
        this.savedGiveawayCommand = this.normalizeGiveawayCommand(settings.giveaway.giveawayCommand)
        this.giveawayCommandExists = false
        this.giveawayCommandConflictName = ''

        if (!waitForReload) {
          this.waitingForReload = false
        }
      } catch (error: any) {
        this.waitingForReload = false
        this.errorMessage = error?.message || 'Failed to save settings'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped lang="scss">
.min-width-0 {
  min-width: 0;
}

.settings-color-preview {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.settings-color-preview--large {
  width: 38px;
  height: 38px;
}

.tts-model-row + .tts-model-row {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>

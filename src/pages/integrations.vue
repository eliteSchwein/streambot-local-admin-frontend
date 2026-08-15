<template>
  <v-card class="overflow-auto mx-auto" max-height="100%" elevation="0" color="transparent" max-width="100%">
    <v-card-title class="d-flex align-center justify-space-between px-3 pt-3">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-connection" />
        <span>{{ $t('integrations.ui.title') }}</span>
      </div>
    </v-card-title>

    <v-card-text class="px-3 pb-3">
      <v-row density="comfortable" align="stretch">
        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-twitch" />
              <span>Twitch</span>
            </v-card-title>

            <v-card-text class="pt-2">
              <v-row density="comfortable" class="integration-form">
                <v-col cols="12" md="6">
                  <v-card variant="tonal">
                    <v-card-title class="d-flex align-center justify-space-between text-subtitle-1">
                      <span>{{ $t('integrations.ui.twitch.controlAuth') }}</span>
                      <v-chip
                        size="x-small"
                        :color="twitchStatus.control ? 'success' : 'warning'"
                        variant="tonal"
                      >
                        {{ twitchStatus.control ? $t('integrations.ui.status.loggedIn') : $t('integrations.ui.status.missing') }}
                      </v-chip>
                    </v-card-title>

                    <v-card-text>
                      {{ $t('integrations.ui.twitch.controlDescription') }}
                    </v-card-text>

                    <v-card-actions>
                      <v-btn
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-login"
                        @click="openTwitchAuth('control')"
                        :disabled="reloadInProgress"
                      >
                        {{ $t('integrations.ui.twitch.authControl') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="tonal">
                    <v-card-title class="d-flex align-center justify-space-between text-subtitle-1">
                      <span>{{ $t('integrations.ui.twitch.messageAuth') }}</span>
                      <v-chip
                        size="x-small"
                        :color="twitchStatus.message ? 'success' : 'grey'"
                        variant="tonal"
                      >
                        {{ twitchStatus.message ? $t('integrations.ui.status.loggedIn') : $t('integrations.ui.status.optional') }}
                      </v-chip>
                    </v-card-title>

                    <v-card-text>
                      {{ $t('integrations.ui.twitch.messageDescription') }}
                    </v-card-text>

                    <v-card-actions>
                      <v-btn
                        color="secondary"
                        variant="flat"
                        prepend-icon="mdi-message-text-outline"
                        @click="openTwitchAuth('message')"
                        :disabled="reloadInProgress"
                      >
                        {{ $t('integrations.ui.twitch.authMessage') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-led-strip-variant" />
                <span>WLED</span>
              </div>
            </v-card-title>

            <v-card-text class="pt-2">
              <v-row density="comfortable" class="integration-form">
                <v-col cols="12" sm="6" md="5">
                  <v-text-field
                    v-model="wledForm.name"
                    :label="$t('integrations.ui.fields.name')"
                    placeholder="desk"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="5">
                  <v-text-field
                    v-model="wledForm.ip"
                    :label="$t('integrations.ui.fields.ipHost')"
                    placeholder="192.168.178.50"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @keydown.enter="addWled"
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="12" md="2">
                  <v-btn
                    block
                    class="integration-action-btn"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    :loading="loading.wledAdd"
                    :disabled="reloadInProgress || (!canAddWled)"
                    @click="addWled"
                  >
                    {{ $t('common.add') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <v-alert
                v-if="!wledEntries.length"
                type="info"
                variant="tonal"
                density="compact"
              >
                {{ $t('integrations.ui.wled.noneConfigured') }}
              </v-alert>

              <v-list v-else bg-color="transparent" density="compact">
                <v-list-item
                  v-for="entry in wledEntries"
                  :key="entry.name"
                  rounded
                  class="mb-2 bg-grey-darken-3"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon icon="mdi-led-strip-variant" />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ entry.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ entry.ip }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn
                      icon="mdi-delete-outline"
                      color="error"
                      variant="text"
                      :loading="loading.wledRemove === entry.name"
                      @click="removeWled(entry.name)"
                      :disabled="reloadInProgress"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-video-box" />
                <span>Yolobox</span>
              </div>
            </v-card-title>

            <v-card-text class="pt-2">
              <v-card variant="tonal" class="integration-inner-card">
                <v-card-title class="d-flex align-center justify-space-between text-subtitle-1">
                  <span>{{ $t('integrations.ui.yolobox.autoDiscovery') }}</span>
                  <v-switch
                    :model-value="yoloboxStatus.enabled"
                    color="primary"
                    density="compact"
                    hide-details
                    :loading="loading.yoloboxToggle"
                    @update:model-value="toggleYolobox"
                    :disabled="reloadInProgress"
                  />
                </v-card-title>

                <v-card-text>
                  <div class="mb-2">
                    {{ $t('integrations.ui.yolobox.discoveryDescription') }}
                  </div>

                  <div class="d-flex ga-2 flex-wrap">
                    <v-chip
                      size="x-small"
                      :color="yoloboxStatus.enabled ? 'success' : 'grey'"
                      variant="tonal"
                    >
                      {{ yoloboxStatus.enabled ? $t('common.enabled') : $t('integrations.ui.status.disabled') }}
                    </v-chip>

                    <v-chip
                      size="x-small"
                      :color="yoloboxStatus.connected ? 'success' : 'grey'"
                      variant="tonal"
                    >
                      {{ yoloboxStatus.connected ? $t('integrations.ui.status.connected') : $t('integrations.ui.status.offline') }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-led-on" />
                <span>Neopixel</span>
              </div>
            </v-card-title>

            <v-card-text class="pt-2">
              <v-row density="comfortable" class="integration-form">
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="neopixelForm.name"
                    :label="$t('integrations.ui.fields.name')"
                    placeholder="tablet_leds"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model.number="neopixelForm.gpio"
                    :label="$t('integrations.ui.fields.gpio')"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model.number="neopixelForm.amount"
                    :label="$t('integrations.ui.fields.amount')"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model.number="neopixelForm.heartbeat_index"
                    :label="$t('integrations.ui.fields.heartbeatIndex')"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @keydown.enter="saveNeopixel"
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="12" md="2">
                  <v-btn
                    block
                    class="integration-action-btn"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-content-save-outline"
                    :loading="loading.neopixelSave"
                    :disabled="reloadInProgress || (!canSaveNeopixel)"
                    @click="saveNeopixel"
                  >
                    {{ $t('common.save') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <v-alert
                v-if="!neopixelEntries.length"
                type="info"
                variant="tonal"
                density="compact"
              >
                {{ $t('integrations.ui.neopixel.noneConfigured') }}
              </v-alert>

              <v-list v-else bg-color="transparent" density="compact">
                <v-list-item
                  v-for="entry in neopixelEntries"
                  :key="entry.name"
                  rounded
                  class="mb-2 bg-grey-darken-3"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon icon="mdi-led-on" />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ entry.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ $t('integrations.ui.neopixel.summary', { gpio: entry.gpio, amount: entry.amount, heartbeat: entry.heartbeat_index ?? $t('integrations.ui.status.none') }) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex align-center ga-2">
                      <v-btn
                        icon="mdi-delete-outline"
                        color="error"
                        variant="text"
                        :loading="loading.neopixelRemove === entry.name"
                        @click="removeNeopixel(entry.name)"
                        :disabled="reloadInProgress"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-video-box" />
                <span>OBS</span>
              </div>
            </v-card-title>

            <v-card-text class="pt-2">
              <v-row density="comfortable" class="integration-form">
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="obsForm.name"
                    :label="$t('integrations.ui.fields.name')"
                    placeholder="default"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="obsForm.ip"
                    :label="$t('integrations.ui.fields.ipHost')"
                    placeholder="127.0.0.1"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model.number="obsForm.port"
                    :label="$t('integrations.ui.fields.port')"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="obsForm.password"
                    :label="$t('integrations.ui.fields.password')"
                    type="password"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @keydown.enter="addObs"
                    :disabled="reloadInProgress"
                  />
                </v-col>

                <v-col cols="12" sm="12" md="2">
                  <v-btn
                    block
                    class="integration-action-btn"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    :loading="loading.obsAdd"
                    :disabled="reloadInProgress || (!canAddObs)"
                    @click="addObs"
                  >
                    {{ $t('common.add') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <v-alert
                v-if="!obsEntries.length"
                type="info"
                variant="tonal"
                density="compact"
              >
                {{ $t('integrations.ui.obs.noneConfigured') }}
              </v-alert>

              <v-list v-else bg-color="transparent" density="compact">
                <v-list-item
                  v-for="entry in obsEntries"
                  :key="entry.name"
                  rounded
                  class="mb-2 bg-grey-darken-3"
                >
                  <template #prepend>
                    <v-avatar :color="entry.connected ? 'success' : 'grey'" variant="tonal">
                      <v-icon icon="mdi-monitor" />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ entry.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ entry.ip }}:{{ entry.port }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex align-center ga-2">
                      <v-chip
                        size="x-small"
                        :color="entry.connected ? 'success' : 'grey'"
                        variant="tonal"
                      >
                        {{ entry.connected ? $t('integrations.ui.status.connected') : $t('integrations.ui.status.offline') }}
                      </v-chip>

                      <v-btn
                        icon="mdi-delete-outline"
                        color="error"
                        variant="text"
                        :loading="loading.obsRemove === entry.name"
                        @click="removeObs(entry.name)"
                        :disabled="reloadInProgress"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>





        <v-col cols="12" lg="6">
          <v-card class="integration-card" color="grey-darken-4" elevation="0">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-robot-outline" />
                <span>Ollama</span>
              </div>

              <v-switch
                :model-value="ollamaStatus.enabled"
                color="primary"
                density="compact"
                hide-details
                :loading="loading.ollamaToggle || ollamaStatus.installing"
                :disabled="reloadInProgress || ollamaStatus.installing || ollamaStatus.changing_model"
                @update:model-value="toggleOllama"
              />
            </v-card-title>

            <v-card-text class="pt-2">
              <div class="d-flex ga-2 flex-wrap mb-4">
                <v-chip
                  size="x-small"
                  :color="ollamaStatus.enabled ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ ollamaStatus.enabled ? $t('common.enabled') : $t('integrations.ui.status.disabled') }}
                </v-chip>

                <v-chip
                  size="x-small"
                  :color="(loading.ollamaToggle || ollamaStatus.installing) ? 'info' : (ollamaStatus.installed ? 'success' : 'grey')"
                  variant="tonal"
                >
                  <v-progress-circular
                    v-if="loading.ollamaToggle || ollamaStatus.installing"
                    indeterminate
                    size="12"
                    width="2"
                    class="mr-1"
                  />
                  {{
                    (loading.ollamaToggle || ollamaStatus.installing)
                      ? $t('integrations.ui.ollama.installingShort')
                      : (ollamaStatus.installed
                        ? $t('integrations.ui.ollama.installed')
                        : $t('integrations.ui.ollama.notInstalled'))
                  }}
                </v-chip>

                <v-chip
                  size="x-small"
                  :color="ollamaStatus.running ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ ollamaStatus.running ? $t('integrations.ui.ollama.running') : $t('integrations.ui.status.offline') }}
                </v-chip>
              </div>

              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                icon="mdi-robot-happy-outline"
                class="mb-4"
              >
                <div class="font-weight-medium mb-1">
                  {{ $t('integrations.ui.ollama.descriptionTitle') }}
                </div>
                <div>
                  {{ $t('integrations.ui.ollama.description') }}
                </div>
                <div class="mt-2 text-medium-emphasis">
                  {{ $t('integrations.ui.ollama.modelWarning') }}
                </div>
              </v-alert>

              <v-alert
                v-if="ollamaStatus.installing"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ $t('integrations.ui.ollama.installing') }}
              </v-alert>

              <v-alert
                v-if="ollamaStatus.changing_model"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ $t('integrations.ui.ollama.changingModel') }}
              </v-alert>

              <v-alert
                v-if="ollamaStatus.error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ ollamaStatus.error }}
              </v-alert>

              <v-row density="comfortable" class="integration-form">
                <v-col cols="12" md="8">
                  <v-combobox
                    :model-value="ollamaSelectedModel"
                    :items="ollamaStatus.models"
                    :label="$t('integrations.ui.ollama.model')"
                    :hint="$t('integrations.ui.ollama.modelHint')"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    clearable
                    :disabled="
                      reloadInProgress
                      || !ollamaStatus.enabled
                      || ollamaStatus.installing
                      || ollamaStatus.changing_model
                    "
                    @update:model-value="setOllamaSelectedModel"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-btn
                    block
                    class="integration-action-btn"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-download"
                    :loading="loading.ollamaModel || ollamaStatus.changing_model"
                    :disabled="
                      reloadInProgress
                      || !ollamaStatus.enabled
                      || ollamaStatus.installing
                      || ollamaStatus.changing_model
                      || !ollamaSelectedModel
                      || ollamaSelectedModel === ollamaStatus.model
                    "
                    @click="changeOllamaModel"
                  >
                    {{ $t('integrations.ui.ollama.changeModel') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
                <div>
                  <div class="text-body-2">
                    {{ $t('integrations.ui.ollama.currentModel') }}
                  </div>
                  <div class="text-medium-emphasis text-caption">
                    {{ ollamaStatus.model || $t('integrations.ui.status.none') }}
                  </div>
                </div>

                <v-btn
                  color="secondary"
                  variant="tonal"
                  prepend-icon="mdi-restart"
                  :loading="loading.ollamaRestart"
                  :disabled="
                    reloadInProgress
                    || !ollamaStatus.enabled
                    || !ollamaStatus.installed
                    || ollamaStatus.external
                    || ollamaStatus.installing
                    || ollamaStatus.changing_model
                  "
                  @click="restartOllama"
                >
                  {{ $t('integrations.ui.ollama.restart') }}
                </v-btn>
              </div>

              <v-expansion-panels class="mt-4" variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center ga-2">
                      <v-icon icon="mdi-server-network" />
                      <span>{{ $t('integrations.ui.ollama.external.title') }}</span>
                      <v-chip
                        v-if="ollamaStatus.external"
                        size="x-small"
                        color="info"
                        variant="tonal"
                      >
                        {{ $t('integrations.ui.ollama.external.active') }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <div class="text-body-2 text-medium-emphasis mb-4">
                      {{ $t('integrations.ui.ollama.external.description') }}
                    </div>

                    <v-switch
                      :model-value="ollamaExternalEnabled"
                      color="primary"
                      density="compact"
                      hide-details
                      :label="$t('integrations.ui.ollama.external.useExternal')"
                      :disabled="reloadInProgress || loading.ollamaExternal"
                      @update:model-value="setOllamaExternalEnabled"
                    />

                    <v-text-field
                      :model-value="ollamaExternalUrl"
                      class="mt-4"
                      :label="$t('integrations.ui.ollama.external.url')"
                      :placeholder="$t('integrations.ui.ollama.external.urlPlaceholder')"
                      density="compact"
                      variant="outlined"
                      hide-details
                      :disabled="reloadInProgress || loading.ollamaExternal || !ollamaExternalEnabled"
                      @update:model-value="setOllamaExternalUrl"
                    />

                    <v-text-field
                      v-model="ollamaExternalApiKey"
                      class="mt-4"
                      :label="$t('integrations.ui.ollama.external.apiKey')"
                      :placeholder="ollamaStatus.has_api_key ? $t('integrations.ui.ollama.external.apiKeyConfigured') : ''"
                      type="password"
                      density="compact"
                      variant="outlined"
                      hide-details
                      autocomplete="new-password"
                      :disabled="reloadInProgress || loading.ollamaExternal || !ollamaExternalEnabled"
                    />

                    <div
                      v-if="ollamaStatus.has_api_key"
                      class="d-flex align-center ga-2 mt-2"
                    >
                      <v-chip size="x-small" color="success" variant="tonal">
                        {{ $t('integrations.ui.ollama.external.apiKeySaved') }}
                      </v-chip>
                      <v-btn
                        size="small"
                        color="error"
                        variant="text"
                        :disabled="reloadInProgress || loading.ollamaExternal"
                        @click="clearOllamaExternalApiKey"
                      >
                        {{ $t('integrations.ui.ollama.external.clearApiKey') }}
                      </v-btn>
                    </div>

                    <v-btn
                      block
                      class="mt-4"
                      color="primary"
                      variant="flat"
                      prepend-icon="mdi-content-save-outline"
                      :loading="loading.ollamaExternal"
                      :disabled="
                        reloadInProgress
                        || loading.ollamaExternal
                        || (ollamaExternalEnabled && !ollamaExternalUrl.trim())
                      "
                      @click="saveOllamaExternal"
                    >
                      {{ $t('common.save') }}
                    </v-btn>
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
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

type TwitchAuthType = 'control' | 'message'

type ObsEntry = {
  name: string
  ip: string
  port: number
  connected: boolean
}

type NeopixelEntry = {
  name: string
  gpio: number
  amount: number
  heartbeat_index?: number
}

export default {
  name: 'IntegrationsPage',

  data() {
    return {
      appStore: useAppStore(),

      wledForm: {
        name: '',
        ip: '',
      },

      obsForm: {
        name: 'default',
        ip: '127.0.0.1',
        port: 4455,
        password: '',
      },

      neopixelForm: {
        name: 'tablet_leds',
        gpio: 17,
        amount: 2,
        heartbeat_index: 1 as number | null,
      },

      ollamaModel: '',
      ollamaExternalEnabledOverride: null as boolean | null,
      ollamaExternalUrlOverride: null as string | null,
      ollamaExternalApiKey: '',

      loading: {
        wledAdd: false,
        wledRemove: '',
        obsAdd: false,
        obsRemove: '',
        yoloboxToggle: false,
        ollamaToggle: false,
        ollamaModel: false,
        ollamaRestart: false,
        ollamaExternal: false,
        neopixelSave: false,
        neopixelRemove: '',
      },

    }
  },

  computed: {
    integrations(): any {
      return this.appStore.getIntegrations ?? {}
    },

    reloadInProgress(): boolean {
      return this.appStore.getReloadUpdate?.finished !== true
    },


    wledIntegrations(): Record<string, any> {
      return this.integrations?.wled ?? {}
    },

    obsIntegrations(): Record<string, any> {
      return this.integrations?.obs ?? {}
    },

    neopixelIntegrations(): Record<string, any> {
      return this.integrations?.neopixel ?? {}
    },

    wledEntries(): any[] {
      return Object.entries(this.wledIntegrations)
        .map(([name, data]: any) => ({
          name,
          ip: data?.ip ?? '',
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    obsEntries(): ObsEntry[] {
      return Object.entries(this.obsIntegrations)
        .map(([name, data]: any) => ({
          name,
          ip: data?.ip ?? '',
          port: Number(data?.port ?? 4455),
          connected: Boolean(data?.connected),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    neopixelEntries(): NeopixelEntry[] {
      return Object.entries(this.neopixelIntegrations)
        .map(([name, data]: any) => ({
          name,
          gpio: Number(data?.gpio ?? 0),
          amount: Number(data?.amount ?? 0),
          heartbeat_index: data?.heartbeat_index === undefined || data?.heartbeat_index === null
            ? undefined
            : Number(data.heartbeat_index),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    yoloboxStatus(): { enabled: boolean; connected: boolean } {
      return {
        enabled: Boolean(this.integrations?.yolobox?.enabled),
        connected: Boolean(this.integrations?.yolobox?.connected),
      }
    },

    ollamaStatus(): {
      enabled: boolean
      installed: boolean
      running: boolean
      installing: boolean
      changing_model: boolean
      model: string
      models: string[]
      external: boolean
      external_url: string
      has_api_key: boolean
      error: string
    } {
      const ollama = this.integrations?.ollama ?? {}

      return {
        enabled: Boolean(ollama.enabled),
        installed: Boolean(ollama.installed),
        running: Boolean(ollama.running),
        installing: Boolean(ollama.installing),
        changing_model: Boolean(ollama.changing_model),
        model: String(ollama.model ?? ''),
        models: Array.isArray(ollama.models) ? ollama.models.map(String) : [],
        external: Boolean(ollama.external),
        external_url: String(ollama.external_url ?? ''),
        has_api_key: Boolean(ollama.has_api_key),
        error: String(ollama.error ?? ''),
      }
    },

    ollamaExternalEnabled(): boolean {
      return this.ollamaExternalEnabledOverride ?? this.ollamaStatus.external
    },

    ollamaExternalUrl(): string {
      return this.ollamaExternalUrlOverride ?? this.ollamaStatus.external_url
    },

    ollamaSelectedModel(): string {
      return this.ollamaModel || this.ollamaStatus.model
    },

    canAddWled(): boolean {
      return Boolean(this.wledForm.name.trim() && this.wledForm.ip.trim())
    },

    canAddObs(): boolean {
      return Boolean(
        this.obsForm.name.trim()
        && this.obsForm.ip.trim()
        && Number(this.obsForm.port) > 0,
      )
    },

    canSaveNeopixel(): boolean {
      return Boolean(
        this.neopixelForm.name.trim()
        && Number.isInteger(Number(this.neopixelForm.gpio))
        && Number(this.neopixelForm.gpio) >= 0
        && Number.isInteger(Number(this.neopixelForm.amount))
        && Number(this.neopixelForm.amount) > 0,
      )
    },

    twitchStatus(): { control: boolean; message: boolean } {
      return {
        control: Boolean(this.integrations?.twitch?.control),
        message: Boolean(this.integrations?.twitch?.message),
      }
    },
  },

  methods: {
    async sendWebsocket(method: string, params: any = {}) {
      const websocketClient = getWebsocketClient()

      if (!websocketClient) {
        this.showError(String(this.$t('integrations.ui.errors.websocketDisconnected')))
        return false
      }

      try {
        const response = await websocketClient.request(method, params)

        if (response?.error) {
          this.showError(response.error?.message ?? response.error ?? String(this.$t('integrations.ui.errors.requestFailed')))
          return false
        }

        return true
      } catch (error) {
        this.showError(error instanceof Error ? error.message : String(error))
        return false
      }
    },

    async addWled() {
      const name = this.wledForm.name.trim()
      const ip = this.wledForm.ip.trim()

      if (!name || !ip) {
        this.showError(String(this.$t('integrations.ui.errors.nameIpRequired')))
        return
      }

      this.loading.wledAdd = true

      const sent = await this.sendWebsocket('wled_add', {
        name,
        ip,
      })

      this.loading.wledAdd = false

      if (!sent) return

      this.wledForm.name = ''
      this.wledForm.ip = ''

    },

    async removeWled(name: string) {
      if (!name) return

      this.loading.wledRemove = name

      const sent = await this.sendWebsocket('wled_remove', {
        name,
      })

      this.loading.wledRemove = ''

      if (!sent) return

    },

    async addObs() {
      const name = this.obsForm.name.trim()
      const ip = this.obsForm.ip.trim()
      const port = Number(this.obsForm.port)
      const password = this.obsForm.password.trim()

      if (!name || !ip || !port) {
        this.showError(String(this.$t('integrations.ui.errors.nameIpPortRequired')))
        return
      }

      this.loading.obsAdd = true

      const sent = await this.sendWebsocket('obs_add', {
        name,
        ip,
        port,
        password,
      })

      this.loading.obsAdd = false

      if (!sent) return

      this.obsForm.password = ''

    },

    async removeObs(name: string) {
      if (!name) return

      this.loading.obsRemove = name

      const sent = await this.sendWebsocket('obs_remove', {
        name,
      })

      this.loading.obsRemove = ''

      if (!sent) return

    },

    async toggleYolobox(enabled: boolean | null) {
      const nextEnabled = Boolean(enabled)

      this.loading.yoloboxToggle = true

      const sent = await this.sendWebsocket('yolobox_toggle', {
        enabled: nextEnabled,
      })

      this.loading.yoloboxToggle = false

      if (!sent) return

    },

    setOllamaExternalEnabled(enabled: boolean | null) {
      this.ollamaExternalEnabledOverride = Boolean(enabled)
    },

    setOllamaExternalUrl(url: string | null) {
      this.ollamaExternalUrlOverride = String(url ?? '')
    },

    async saveOllamaExternal() {
      const external = this.ollamaExternalEnabled
      const externalUrl = this.ollamaExternalUrl.trim()

      if (external && !externalUrl) {
        this.showError(String(this.$t('integrations.ui.ollama.external.urlRequired')))
        return
      }

      this.loading.ollamaExternal = true

      try {
        const sent = await this.sendWebsocket('ollama_external', {
          external,
          external_url: externalUrl,
          api_key: this.ollamaExternalApiKey.trim() || undefined,
        })

        if (sent) {
          this.ollamaExternalEnabledOverride = null
          this.ollamaExternalUrlOverride = null
          this.ollamaExternalApiKey = ''
        }
      } finally {
        this.loading.ollamaExternal = false
      }
    },

    async clearOllamaExternalApiKey() {
      this.loading.ollamaExternal = true

      try {
        const sent = await this.sendWebsocket('ollama_external', {
          external: this.ollamaExternalEnabled,
          external_url: this.ollamaExternalUrl.trim(),
          clear_api_key: true,
        })

        if (sent) {
          this.ollamaExternalApiKey = ''
          this.ollamaExternalEnabledOverride = null
          this.ollamaExternalUrlOverride = null
        }
      } finally {
        this.loading.ollamaExternal = false
      }
    },

    setOllamaSelectedModel(model: string | null) {
      this.ollamaModel = String(model ?? '')
    },

    async toggleOllama(enabled: boolean | null) {
      this.loading.ollamaToggle = true

      try {
        await this.sendWebsocket('ollama_toggle', {
          enabled: Boolean(enabled),
        })
      } finally {
        this.loading.ollamaToggle = false
      }
    },

    async changeOllamaModel() {
      const model = this.ollamaSelectedModel.trim()

      if (!model || model === this.ollamaStatus.model) return

      this.loading.ollamaModel = true

      try {
        const sent = await this.sendWebsocket('ollama_change_model', {
          model,
        })

        if (sent) {
          this.ollamaModel = ''
        }
      } finally {
        this.loading.ollamaModel = false
      }
    },

    async restartOllama() {
      this.loading.ollamaRestart = true

      try {
        await this.sendWebsocket('ollama_restart')
      } finally {
        this.loading.ollamaRestart = false
      }
    },

    async saveNeopixel() {
      const name = this.neopixelForm.name.trim()
      const gpio = Number(this.neopixelForm.gpio)
      const amount = Number(this.neopixelForm.amount)
      const heartbeatIndex = this.neopixelForm.heartbeat_index === null || this.neopixelForm.heartbeat_index === undefined
        ? undefined
        : Number(this.neopixelForm.heartbeat_index)

      if (!name || !Number.isInteger(gpio) || gpio < 0 || !Number.isInteger(amount) || amount <= 0) {
        this.showError(String(this.$t('integrations.ui.errors.nameGpioAmountRequired')))
        return
      }

      if (heartbeatIndex !== undefined && (!Number.isInteger(heartbeatIndex) || heartbeatIndex < 0 || heartbeatIndex >= amount)) {
        this.showError(String(this.$t('integrations.ui.errors.heartbeatOutOfRange')))
        return
      }

      this.loading.neopixelSave = true

      const sent = await this.sendWebsocket('neopixel_add', {
        name,
        gpio,
        amount,
        heartbeat_index: heartbeatIndex,
      })

      this.loading.neopixelSave = false

      if (!sent) return

    },

    async removeNeopixel(name: string) {
      if (!name) return

      this.loading.neopixelRemove = name

      const sent = await this.sendWebsocket('neopixel_remove', {
        name,
      })

      this.loading.neopixelRemove = ''

      if (!sent) return

      if (this.neopixelForm.name === name) {
        this.neopixelForm = {
          name: 'tablet_leds',
          gpio: 17,
          amount: 2,
          heartbeat_index: 1,
        }
      }

    },

    openTwitchAuth(type: TwitchAuthType) {
      const returnTo = encodeURIComponent(window.location.href)

      window.location.href = `${this.appStore.getRestApi}/api/auth/twitch?type=${type}&returnTo=${returnTo}`
    },

    showError(text: string) {
      console.error(text)
    },
  },
}
</script>


<style scoped>
.integration-card {
  height: 100%;
}

.integration-card :deep(.v-card-title) {
  min-height: 56px;
  padding-bottom: 8px;
}

.integration-card :deep(.v-card-text) {
  padding-top: 8px;
}

.integration-form {
  align-items: center;
}

.integration-action-btn {
  min-height: 40px;
}

.integration-inner-card {
  min-height: 118px;
}

.integration-card :deep(.v-list) {
  padding-top: 0;
}
</style>

<script>

import {mapActions, mapState} from "pinia";
import {useAppStore} from "@/stores/app";
import eventBus from "@/eventBus.js";
import {getWebsocketClient} from "@/plugins/websocketInstance";
import NavbarConnectionsButton from "@/components/navbar/NavbarConnectionsButton.vue";
import NavbarSystemInfoButton from "@/components/navbar/NavbarSystemInfoButton.vue";
import NavbarShieldButton from "@/components/navbar/NavbarShieldButton.vue";
import NavbarLiveViewCountButton from "@/components/navbar/NavbarLiveViewCountButton.vue";
import NavbarLiveStatusButton from "@/components/navbar/NavbarLiveStatusButton.vue";
import NavbarReloadStatus from "@/components/navbar/NavbarReloadStatus.vue";
import NavbarUpdateStatus from "@/components/navbar/NavbarUpdateStatus.vue";
import NavbarThrottleWarning from "@/components/navbar/NavbarThrottleWarning.vue";
import NavbarPowerButton from "@/components/navbar/NavbarPowerButton.vue";

export default {
  components: {
    NavbarConnectionsButton,
    NavbarSystemInfoButton,
    NavbarShieldButton,
    NavbarLiveViewCountButton,
    NavbarLiveStatusButton,
    NavbarReloadStatus,
    NavbarUpdateStatus,
    NavbarThrottleWarning,
    NavbarPowerButton,
  },
  data () {
    return {
      rail: true,
      dashboardEditMode: false,
      navbarAddMenuOpen: false,
      navbarAddMenuX: 0,
      navbarAddMenuY: 0,
      navbarInsertIndex: 0,
      navbarDragKey: '',
      navbarDropIndex: -1,
      navbarSaveTimer: null
    }
  },
  mounted() {
    eventBus.$on('dashboard:edit-state', this.onDashboardEditState)
    window.addEventListener('drop', this.handleGlobalNavbarDragCleanup)
    window.addEventListener('dragend', this.handleGlobalNavbarDragCleanup)
    window.addEventListener('blur', this.handleGlobalNavbarDragCleanup)
  },
  beforeUnmount() {
    eventBus.$off('dashboard:edit-state', this.onDashboardEditState)
    window.removeEventListener('drop', this.handleGlobalNavbarDragCleanup)
    window.removeEventListener('dragend', this.handleGlobalNavbarDragCleanup)
    window.removeEventListener('blur', this.handleGlobalNavbarDragCleanup)
    if (this.navbarSaveTimer) clearTimeout(this.navbarSaveTimer)
  },
  computed: {
    ...mapState(useAppStore, [
      'getRestApi',
      'isShieldActive',
      'getSystemInfo',
      'isThrottled',
      'getConnections',
      'getCurrentGame',
      'getParsedBackendConfig',
      'getObsAudioData',
      'hasObsEnabled',
      'hasYoloboxEnabled',
      'getReloadUpdate',
      'getUpdateManager',
      'getSettings'
    ]),


    topNavbarDefinitions() {
      return [
        { key: 'connections', icon: 'mdi-webhook', label: this.$t('settings.topNavbar.items.connections'), defaultEnabled: false },
        { key: 'system_info', icon: 'mdi-cpu-64-bit', label: this.$t('settings.topNavbar.items.systemInfo'), defaultEnabled: true },
        { key: 'shield', icon: 'mdi-shield-outline', label: this.$t('settings.topNavbar.items.shield'), defaultEnabled: false },
        { key: 'live_viewers', icon: 'mdi-account-eye-outline', label: this.$t('settings.topNavbar.items.liveViewers'), defaultEnabled: false },
        { key: 'live_status', icon: 'mdi-broadcast', label: this.$t('settings.topNavbar.items.liveStatus'), defaultEnabled: true },
      ]
    },

    systemInfoMetricDefinitions() {
      return [
        { key: 'cpu_load', icon: 'mdi-cpu-64-bit', label: this.$t('settings.topNavbar.systemInfoMetrics.cpuLoad') },
        { key: 'cpu_temp', icon: 'mdi-thermometer', label: this.$t('settings.topNavbar.systemInfoMetrics.cpuTemp') },
        { key: 'memory', icon: 'mdi-memory', label: this.$t('settings.topNavbar.systemInfoMetrics.memory') },
        { key: 'internal_storage', icon: 'mdi-harddisk', label: this.$t('settings.topNavbar.systemInfoMetrics.internalStorage') },
        { key: 'external_storage', icon: 'mdi-usb', label: this.$t('settings.topNavbar.systemInfoMetrics.externalStorage') },
      ]
    },

    selectedSystemInfoMetrics() {
      const configured = this.getSettings?.local_admin_panel?.system_info?.metrics
      const allowed = new Set(this.systemInfoMetricDefinitions.map(item => item.key))
      if (!Array.isArray(configured)) return ['cpu_load', 'memory', 'internal_storage']
      return configured.map(value => String(value)).filter(value => allowed.has(value))
    },

    externalStorageEntries() {
      const entries = this.getSystemInfo?.components?.storage?.external
      return Array.isArray(entries) ? entries : []
    },

    allOptionalTopNavbarItems() {
      const configured = this.getSettings?.local_admin_panel?.top_navbar
      const optionalKeys = new Set(this.topNavbarDefinitions.map(item => item.key))
      const rawOptional = Array.isArray(configured)
        ? configured.filter(item => optionalKeys.has(String(item?.key ?? '').trim()))
        : []
      const hasConfiguredNavbar = Array.isArray(configured)
      const byKey = new Map()

      rawOptional.forEach((raw, index) => {
        const key = String(raw?.key ?? '').trim()
        if (!key || byKey.has(key)) return
        byKey.set(key, {
          key,
          enabled: raw?.enabled !== false,
          order: Number.isFinite(Number(raw?.order)) ? Number(raw.order) : index,
          })
      })

      for (const [index, definition] of this.topNavbarDefinitions.entries()) {
        if (byKey.has(definition.key)) continue
        byKey.set(definition.key, {
          key: definition.key,
          enabled: !hasConfiguredNavbar ? definition.defaultEnabled !== false : false,
          order: byKey.size + index,
        })
      }

      return Array.from(byKey.values())
        .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))
        .map((item, order) => ({ ...item, order }))
    },

    activeOptionalTopNavbarItems() {
      return this.allOptionalTopNavbarItems.filter(item => item.enabled !== false)
    },

    hiddenOptionalTopNavbarItems() {
      const active = new Set(this.activeOptionalTopNavbarItems.map(item => item.key))
      return this.topNavbarDefinitions.filter(item => !active.has(item.key))
    },

    hasAvailableUpdates() {
      return Object.values(this.getUpdateManager ?? {})
        .some((manager) => manager?.update_available === true)
    },

    updatingManagers() {
      return Object.entries(this.getUpdateManager ?? {})
        .filter(([, manager]) => manager?.updating === true)
        .map(([name, manager]) => manager?.name || name)
    },

    hasUpdateInProgress() {
      return this.updatingManagers.length > 0
    },

    updateInProgressTitle() {
      if (this.updatingManagers.length === 0) {
        return this.$t('navigation.status.updateInProgress')
      }

      return this.$t('navigation.status.updateInProgressManager', {
        manager: this.updatingManagers.join(', ')
      })
    },

    currentRouteTitle() {
      const path = this.$route.path || '/';
      const firstPathPart = path.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] || 'dashboard';

      const titleMap = {
        dashboard: 'dashboard',
        channelPoints: 'channelPoints',
        events: 'events',
        macros: 'macros',
        rotatingscenes: 'rotatingscene',
        variables: 'variables',
        audio: 'audio',
        music: 'music',
        overlay: 'overlay',
        assets: 'assets',
        media: 'media',
        yolobox: 'yolobox',
        connections: 'connections',
        recovery: 'recovery',
        obs: 'obs',
        system: 'system',
        settings: 'settings',
        categories: 'categories'
      };

      const titleKey = titleMap[firstPathPart] || firstPathPart;
      const translationKey = `navigation.tabs.${titleKey}`;

      return this.$te(translationKey)
        ? this.$t(translationKey)
        : this.$t('navigation.tabs.dashboard');
    },
  },
  methods: {
    handleGlobalNavbarDragCleanup() {
      if (!this.navbarDragKey && this.navbarDropIndex < 0) return
      this.endNavbarDrag()
    },

    onDashboardEditState(enabled) {
      this.dashboardEditMode = Boolean(enabled)
      if (!this.dashboardEditMode) {
        this.navbarAddMenuOpen = false
        this.navbarDropIndex = -1
      }
    },
    toggleDashboardEdit() {
      eventBus.$emit('dashboard:toggle-edit')
    },
    navbarDefinition(key) {
      return this.topNavbarDefinitions.find(item => item.key === key)
    },
    navbarItemLabel(item) {
      return this.navbarDefinition(item?.key)?.label || item?.key
    },
    navbarItemIcon(item) {
      return this.navbarDefinition(item?.key)?.icon || 'mdi-circle-small'
    },
    systemInfoMetricEnabled(key) {
      return this.selectedSystemInfoMetrics.includes(key)
    },
    async saveLocalAdminPanelPatch(patch) {
      const client = getWebsocketClient()
      if (!client?.request) return

      const store = useAppStore()
      const currentSettings = store.getSettings ?? {}
      const currentPanel = currentSettings.local_admin_panel ?? {}
      const nextPanel = {
        ...currentPanel,
        ...patch,
      }

      try {
        await client.request('settings_save', {
          local_admin_panel: nextPanel,
        }, 10_000)

        store.setSettings({
          ...currentSettings,
          local_admin_panel: nextPanel,
        })
      } catch (error) {
        console.error('saving local admin panel settings failed', error)
      }
    },
    queueNavbarSave() {
      if (this.navbarSaveTimer) clearTimeout(this.navbarSaveTimer)
      this.navbarSaveTimer = setTimeout(() => {
        this.navbarSaveTimer = null
        void this.saveNavbarItems(this.allOptionalTopNavbarItems)
      }, 180)
    },
    async saveNavbarItems(items) {
      const normalized = (items ?? []).map((item, order) => ({
        key: String(item.key),
        enabled: item.enabled !== false,
        order,
      }))
      await this.saveLocalAdminPanelPatch({ top_navbar: normalized })
    },
    async setSystemInfoMetric(key, enabled) {
      const allowed = this.systemInfoMetricDefinitions.map(item => item.key)
      const next = new Set(this.selectedSystemInfoMetrics)
      if (enabled) next.add(key)
      else next.delete(key)

      const metrics = allowed.filter(metric => next.has(metric))
      await this.saveLocalAdminPanelPatch({
        system_info: {
          ...(this.getSettings?.local_admin_panel?.system_info ?? {}),
          metrics,
        },
      })
    },
    openNavbarInsertMenu(index, event) {
      if (this.hiddenOptionalTopNavbarItems.length === 0) return
      this.navbarInsertIndex = Math.max(0, Math.min(Number(index) || 0, this.activeOptionalTopNavbarItems.length))
      this.navbarAddMenuX = Number(event?.clientX ?? 0)
      this.navbarAddMenuY = Number(event?.clientY ?? 0)
      this.navbarAddMenuOpen = true
    },
    addNavbarItem(key) {
      const target = String(key ?? '').trim()
      if (!target) return

      const active = this.activeOptionalTopNavbarItems.map(item => ({ ...item }))
      const inactive = this.allOptionalTopNavbarItems.filter(item => !item.enabled).map(item => ({ ...item }))
      const source = inactive.find(item => item.key === target)
      if (!source) return

      const insertAt = Math.max(0, Math.min(this.navbarInsertIndex, active.length))
      source.enabled = true
      active.splice(insertAt, 0, source)

      const remainingInactive = inactive.filter(item => item.key !== target)
      this.navbarAddMenuOpen = false
      void this.saveNavbarItems([...active, ...remainingInactive])
    },
    removeNavbarItem(key) {
      const active = this.activeOptionalTopNavbarItems
        .filter(item => item.key !== key)
        .map(item => ({ ...item }))
      const inactive = this.allOptionalTopNavbarItems
        .filter(item => !item.enabled || item.key === key)
        .map(item => ({ ...item, enabled: item.key === key ? false : item.enabled }))
      void this.saveNavbarItems([...active, ...inactive])
    },
    startNavbarDrag(key, event) {
      this.navbarDragKey = key
      this.navbarDropIndex = -1
      event?.dataTransfer?.setData('text/plain', key)
      if (event?.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    },
    endNavbarDrag() {
      this.navbarDragKey = ''
      this.navbarDropIndex = -1
    },
    setNavbarDropIndex(index) {
      this.navbarDropIndex = Math.max(0, Math.min(Number(index) || 0, this.activeOptionalTopNavbarItems.length))
    },
    dropNavbarAt(index) {
      const sourceKey = this.navbarDragKey
      if (!sourceKey) {
        this.endNavbarDrag()
        return
      }

      const active = this.activeOptionalTopNavbarItems.map(item => ({ ...item }))
      const sourceIndex = active.findIndex(item => item.key === sourceKey)
      if (sourceIndex < 0) {
        this.endNavbarDrag()
        return
      }

      const [source] = active.splice(sourceIndex, 1)
      let insertAt = Number(index) || 0
      if (sourceIndex < insertAt) insertAt -= 1
      insertAt = Math.max(0, Math.min(insertAt, active.length))
      active.splice(insertAt, 0, source)

      const inactive = this.allOptionalTopNavbarItems.filter(item => !item.enabled).map(item => ({ ...item }))
      this.endNavbarDrag()
      void this.saveNavbarItems([...active, ...inactive])
    },
  }
}
</script>

<template>
  <v-app-bar
    prominent
    rounded="0"
    density="compact"
    class="topbar"
    color="grey-darken-3"
    extended
    extension-height="10"
  >
    <v-app-bar-nav-icon variant="text" @click.stop="rail = !rail"></v-app-bar-nav-icon>

    <div class="topbar-title-group">
      <span class="topbar-page-title">{{ currentRouteTitle }}</span>
      <v-btn
        v-if="$route.path === '/'"
        class="dashboard-edit-button"
        icon="mdi-pencil"
        size="x-small"
        variant="text"
        :color="dashboardEditMode ? 'primary' : undefined"
        :title="dashboardEditMode ? $t('dashboard.customize.done') : $t('dashboard.customize.edit')"
        @click="toggleDashboardEdit"
      />
    </div>

    <v-spacer></v-spacer>

    <!-- Fixed system actions are individual components and hidden during edit mode. -->
    <template v-if="!dashboardEditMode">
      <NavbarReloadStatus />
      <NavbarUpdateStatus />
    </template>

    <div v-if="dashboardEditMode" class="topbar-navbar-editor mr-1" :class="{ 'topbar-navbar-editor--dragging': Boolean(navbarDragKey) }">
      <template v-for="(item, index) in activeOptionalTopNavbarItems" :key="`navbar-edit-${item.key}`">
        <div
          class="topbar-navbar-drop-zone"
          :class="{ 'topbar-navbar-drop-zone--active': navbarDropIndex === index }"
          @dragenter.prevent="setNavbarDropIndex(index)"
          @dragover.prevent="setNavbarDropIndex(index)"
          @drop.stop.prevent="dropNavbarAt(index)"
          @click.stop="openNavbarInsertMenu(index, $event)"
        >
          <template v-if="!navbarDragKey && hiddenOptionalTopNavbarItems.length">
            <v-icon icon="mdi-plus" size="14" />
            <span>{{ $t('settings.topNavbar.addItem') }}</span>
          </template>
          <span v-else-if="navbarDragKey">{{ $t('settings.topNavbar.dropHere') }}</span>
        </div>

        <div
          class="topbar-navbar-editor__item"
          :class="{ 'topbar-navbar-editor__item--dragging': navbarDragKey === item.key }"
          draggable="true"
          @dragstart="startNavbarDrag(item.key, $event)"
          @dragend="endNavbarDrag"
        >
          <v-icon icon="mdi-drag" size="16" class="mr-1" />
          <v-icon :icon="navbarItemIcon(item)" size="18" />
          <span class="mx-2 ubuntu-mono text-caption">{{ navbarItemLabel(item) }}</span>

          <v-menu v-if="item.key === 'system_info'" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-tune-variant"
                size="x-small"
                variant="text"
                :title="$t('settings.topNavbar.systemInfoMetrics.title')"
                @mousedown.stop
                @dragstart.prevent
              />
            </template>
            <v-card min-width="280" class="pa-2">
              <v-list density="compact">
                <v-list-subheader>{{ $t('settings.topNavbar.systemInfoMetrics.title') }}</v-list-subheader>
                <v-list-item
                  v-for="metric in systemInfoMetricDefinitions"
                  :key="metric.key"
                  :prepend-icon="metric.icon"
                  :title="metric.label"
                  @click.stop="setSystemInfoMetric(metric.key, !systemInfoMetricEnabled(metric.key))"
                >
                  <template #append>
                    <v-checkbox-btn
                      :model-value="systemInfoMetricEnabled(metric.key)"
                      @click.stop
                      @update:model-value="setSystemInfoMetric(metric.key, $event)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            :title="$t('common.delete')"
            @mousedown.stop
            @dragstart.prevent
            @click.stop="removeNavbarItem(item.key)"
          />
        </div>
      </template>

      <div
        class="topbar-navbar-drop-zone topbar-navbar-drop-zone--end"
        :class="{ 'topbar-navbar-drop-zone--active': navbarDropIndex === activeOptionalTopNavbarItems.length }"
        @dragenter.prevent="setNavbarDropIndex(activeOptionalTopNavbarItems.length)"
        @dragover.prevent="setNavbarDropIndex(activeOptionalTopNavbarItems.length)"
        @drop.stop.prevent="dropNavbarAt(activeOptionalTopNavbarItems.length)"
        @click.stop="openNavbarInsertMenu(activeOptionalTopNavbarItems.length, $event)"
      >
        <template v-if="!navbarDragKey && hiddenOptionalTopNavbarItems.length">
          <v-icon icon="mdi-plus" size="14" />
          <span>{{ $t('settings.topNavbar.addItem') }}</span>
        </template>
        <span v-else-if="navbarDragKey">{{ $t('settings.topNavbar.dropHere') }}</span>
      </div>

      <v-menu
        v-model="navbarAddMenuOpen"
        :target="[navbarAddMenuX, navbarAddMenuY]"
        location="bottom start"
        :close-on-content-click="true"
      >
        <v-list density="compact" min-width="220">
          <v-list-item
            v-for="item in hiddenOptionalTopNavbarItems"
            :key="item.key"
            :prepend-icon="item.icon"
            :title="item.label"
            @click="addNavbarItem(item.key)"
          />
          <v-list-item
            v-if="hiddenOptionalTopNavbarItems.length === 0"
            prepend-icon="mdi-check"
            :title="$t('settings.topNavbar.noItemsToAdd')"
            disabled
          />
        </v-list>
      </v-menu>
    </div>

    <template v-else>
      <template v-for="item in activeOptionalTopNavbarItems" :key="item.key">
        <NavbarConnectionsButton v-if="item.key === 'connections'" />
        <NavbarSystemInfoButton v-else-if="item.key === 'system_info'" />
        <NavbarShieldButton v-else-if="item.key === 'shield'" />
        <NavbarLiveViewCountButton v-else-if="item.key === 'live_viewers'" />
        <NavbarLiveStatusButton v-else-if="item.key === 'live_status'" />
      </template>
    </template>

    <template v-if="!dashboardEditMode">
      <NavbarThrottleWarning />
      <NavbarPowerButton />
    </template>

    <template #extension>
      <v-progress-linear
        :model-value="100"
        :color="getCurrentGame?.theme?.color ?? 'grey-darken-3'"
        height="3"
      />
    </template>
  </v-app-bar>
  <v-navigation-drawer
    class="secondary"
    :model-value="rail"
  >
    <v-list color="transparent">
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        :title="$t('navigation.tabs.dashboard')"
        color=""
        to="/"></v-list-item>
      <v-divider></v-divider>
      <v-list-subheader>{{ $t('navigation.sections.automation') }}</v-list-subheader>
      <v-list-item
        prepend-icon="mdi-motion-play-outline"
        :title="$t('navigation.tabs.channelPoints')"
        color=""
        to="/channelPoints"></v-list-item>
      <v-list-item
        prepend-icon="mdi-lightning-bolt"
        :title="$t('navigation.tabs.events')"
        color=""
        to="/events"></v-list-item>
      <v-list-item
        prepend-icon="mdi-console-line"
        :title="$t('navigation.tabs.commands')"
        color=""
        to="/commands"></v-list-item>
      <v-list-item
        prepend-icon="mdi-dialpad"
        :title="$t('navigation.tabs.macros')"
        color=""
        to="/macros"></v-list-item>
      <v-list-item
        prepend-icon="mdi-auto-mode"
        :title="$t('navigation.tabs.automacros')"
        color=""
        to="/automacros"></v-list-item>
      <v-list-item
        prepend-icon="mdi-filmstrip"
        :title="$t('navigation.tabs.rotatingscene')"
        color=""
        to="/rotatingscenes"></v-list-item>
      <v-list-item
        prepend-icon="mdi-variable"
        :title="$t('navigation.tabs.variables')"
        color=""
        to="/variables"></v-list-item>
      <v-divider></v-divider>
      <v-list-subheader>{{ $t('navigation.sections.audio') }}</v-list-subheader>
      <v-list-item
        prepend-icon="mdi-volume-high"
        :title="$t('navigation.tabs.audio')"
        color=""
        to="/audio"></v-list-item>
      <v-list-item
        prepend-icon="mdi-music"
        :title="$t('navigation.tabs.music')"
        color=""
        to="/music"></v-list-item>
      <v-divider></v-divider>
      <v-list-subheader>{{ $t('navigation.sections.overlay') }}</v-list-subheader>
      <v-list-item
        prepend-icon="mdi-picture-in-picture-top-right"
        :title="$t('navigation.tabs.overlay')"
        color=""
        to="/overlay"></v-list-item>
      <v-list-item
        prepend-icon="mdi-palette"
        :title="$t('navigation.tabs.assets')"
        color=""
        to="/assets"></v-list-item>
      <v-list-item
        prepend-icon="mdi-multimedia"
        :title="$t('navigation.tabs.media')"
        color=""
        to="/media"></v-list-item>
      <v-divider></v-divider>
      <v-list-subheader>{{ $t('navigation.sections.streamingServices') }}</v-list-subheader>
      <v-list-item
        prepend-icon="mdi-gamepad-variant-outline"
        :title="$t('navigation.tabs.categories')"
        color=""
        to="/categories"></v-list-item>
      <v-list-item
        v-if="hasObsEnabled"
        prepend-icon="mdi-video-box"
        :title="$t('navigation.tabs.obs')"
        color=""
        to="/obs"></v-list-item>
      <v-list-item
        v-if="hasYoloboxEnabled"
        prepend-icon="mdi-video-box"
        :title="$t('navigation.tabs.yolobox')"
        color=""
        to="/yolobox"></v-list-item>
      <v-divider></v-divider>
      <v-list-subheader>{{ $t('navigation.sections.systemTools') }}</v-list-subheader>
      <v-list-item
        :title="$t('navigation.tabs.system')"
        color=""
        to="/system"
      >
        <template #prepend>
          <v-badge
            :model-value="hasAvailableUpdates || hasUpdateInProgress"
            :color="hasUpdateInProgress ? 'primary' : 'warning'"
            dot
          >
            <v-icon icon="mdi-server"></v-icon>
          </v-badge>
        </template>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-cog"
        :title="$t('navigation.tabs.settings')"
        color=""
        to="/settings"></v-list-item>
      <v-list-item
        prepend-icon="mdi-vector-link"
        :title="$t('navigation.tabs.integrations')"
        color=""
        to="/integrations"></v-list-item>
      <v-list-item
        prepend-icon="mdi-webhook"
        :title="$t('navigation.tabs.connections')"
        color=""
        to="/connections"></v-list-item>
      <!--
      <v-list-item
        prepend-icon="mdi-heart-cog"
        :title="$t('navigation.tabs.recovery')"
        color=""
        to="/recovery"></v-list-item>
      -->
    </v-list>
  </v-navigation-drawer>


</template>

<style scoped lang="scss">
.update-progress-button {
  min-width: 190px;
}

.cpu-entry {
  width: 65px;
  max-width: 65px;
  display: flex;
  align-items: flex-start;

  i {
    margin-top: 4px;
  }

  span {
    margin-top: 2px;
    font-size: 15px;
  }
}

.reload-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 36px;
  border-radius: 4px;
  background: rgb(var(--v-theme-grey-darken-4));
}

.topbar-icon-button {
  min-width: 36px !important;
  width: 36px;
  padding-inline: 0 !important;
}

.topbar-title-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-left: 8px;
}

.topbar-page-title {
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.dashboard-edit-button {
  margin-left: 2px;
}

.topbar-navbar-editor {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.topbar-navbar-editor__item {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 0 2px 0 8px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.7);
  border-radius: 6px;
  background: rgba(var(--v-theme-grey-darken-4), 0.88);
  cursor: grab;
  user-select: none;
}

.topbar-navbar-editor__item--dragging {
  opacity: 0.45;
}

.topbar-navbar-drop-zone {
  width: 18px;
  min-width: 18px;
  height: 34px;
  flex: 0 0 18px;
  border: 1px dashed rgba(var(--v-theme-primary), .32);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: rgba(var(--v-theme-on-surface), .42);
  background: rgba(var(--v-theme-primary), .035);
  overflow: hidden;
  cursor: pointer;
  transition: width 110ms ease, min-width 110ms ease, flex-basis 110ms ease, background 90ms ease, border-color 90ms ease, color 90ms ease;
}

.topbar-navbar-drop-zone > span {
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 90ms ease;
}

.topbar-navbar-drop-zone > .v-icon {
  opacity: .55;
}

.topbar-navbar-editor:not(.topbar-navbar-editor--dragging) .topbar-navbar-drop-zone:hover,
.topbar-navbar-drop-zone--active {
  width: 72px;
  min-width: 72px;
  flex-basis: 72px;
  border-color: rgba(var(--v-theme-primary), .85);
  background: rgba(var(--v-theme-primary), .12);
  color: rgba(var(--v-theme-on-surface), .82);
}

.topbar-navbar-editor:not(.topbar-navbar-editor--dragging) .topbar-navbar-drop-zone:hover > span,
.topbar-navbar-drop-zone--active > span,
.topbar-navbar-editor:not(.topbar-navbar-editor--dragging) .topbar-navbar-drop-zone:hover > .v-icon,
.topbar-navbar-drop-zone--active > .v-icon {
  opacity: 1;
}

.system-info-navbar-button {
  min-width: 0 !important;
}

.system-info-navbar-entry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  white-space: nowrap;
}

.system-info-navbar-entry:last-child {
  margin-right: 0;
}

.system-info-navbar-value {
  display: inline-block;
  width: 6ch;
  min-width: 6ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
</style>

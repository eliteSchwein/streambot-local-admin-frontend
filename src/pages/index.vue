<template>
  <v-card
    class="overflow-auto mx-auto"
    max-height="100%"
    max-width="100%"
    elevation="0"
    color="transparent"
  >
    <div
      ref="dashboardBoard"
      class="dashboard-layout mx-4"
      :class="{ 'dashboard-layout--editing': editMode }"
      :style="{ '--dashboard-columns': dashboardColumnCount }"
    >
      <div
        v-for="(column, columnIndex) in dashboardColumns"
        :key="`dashboard-column-${columnIndex}`"
        class="dashboard-column"
        :class="{ 'dashboard-column--editing': editMode }"
        @dragover.self.prevent="setDropTarget(columnIndex, column.length)"
        @dragenter.self.prevent="setDropTarget(columnIndex, column.length)"
        @drop.self.stop="dropCardAt(columnIndex, column.length)"
      >
        <template v-for="(entry, entryIndex) in column" :key="entry.card.key">
          <div
            v-if="editMode"
            class="dashboard-drop-zone"
            :class="{ 'dashboard-drop-zone--active': isDropTarget(columnIndex, entryIndex) }"
            @dragenter.prevent="setDropTarget(columnIndex, entryIndex)"
            @dragover.prevent="setDropTarget(columnIndex, entryIndex)"
            @drop.stop="dropCardAt(columnIndex, entryIndex)"
            @click="openAddCardAt(columnIndex, entryIndex, $event)"
          >
            <template v-if="!draggedCard"><v-icon icon="mdi-plus" size="16" /><span>{{ $t('dashboard.customize.addCard') }}</span></template>
            <span v-else>{{ $t('dashboard.customize.dropHere') }}</span>
          </div>
          <div
            class="dashboard-card-shell"
            :class="{
              'dashboard-card-shell--editing': editMode,
              'dashboard-card-shell--dragging': draggedCard === entry.card.key,
            }"

          >
            <div
              v-if="editMode"
              class="dashboard-card-editor-bar"
              draggable="true"
              @dragstart="startDrag(entry.card.key, $event)"
              @dragend="endDrag"
            >
              <div class="d-flex align-center ga-2 min-width-0 dashboard-card-drag-area">
                <v-icon icon="mdi-drag" size="20" />
                <v-icon :icon="cardIcon(entry.card.key)" size="18" />
                <span class="text-body-2 font-weight-medium text-truncate">
                  {{ cardLabel(entry.card.key) }}
                </span>
                <span class="text-caption text-medium-emphasis dashboard-drag-hint">
                  {{ $t('dashboard.customize.dragCard') }}
                </span>
              </div>

              <div class="d-flex align-center ga-1">
                <v-btn
                  v-if="entry.card.key === 'macros'"
                  icon="mdi-tune-variant"
                  size="x-small"
                  variant="text"
                  :title="$t('dashboard.customize.selectMacros')"
                  @mousedown.stop
                  @dragstart.prevent
                  @click.stop="openMacrosPicker"
                />
                <v-btn
                  v-if="entry.card.key === 'commands'"
                  icon="mdi-tune-variant"
                  size="x-small"
                  variant="text"
                  :title="$t('dashboard.commands.select')"
                  @mousedown.stop
                  @dragstart.prevent
                  @click.stop="openCommandsPicker"
                />
                <v-btn
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  :disabled="visibleCards.length <= 1"
                  :title="$t('dashboard.customize.removeCard')"
                  @mousedown.stop
                  @dragstart.prevent
                  @click.stop="hideCard(entry.card.key)"
                />
              </div>
            </div>

            <div class="dashboard-card-content">
            <giveaway v-if="entry.card.key === 'giveaway'" />
            <InteractionQueue v-else-if="entry.card.key === 'interactions'" />

            <template v-else-if="entry.card.key === 'auto_macros'">
              <v-alert
                v-if="getAutoMacros.length === 0"
                type="info"
                color="gray-darken-3"
                :text="$t('dashboard.noAutoMacros')"
              />
              <template v-else>
                <template v-for="autoMacro in getAutoMacros" :key="autoMacro.name">
                  <autoMacro :autoMacro="autoMacro" />
                </template>
              </template>
            </template>

            <MusicControls v-else-if="entry.card.key === 'music'" :pause-visualizer="editMode" />
            <DashboardMacrosCard
              v-else-if="entry.card.key === 'macros'"
              ref="dashboardMacrosCard"
              :selected-macros="dashboardLayout.macro_names"
              @update:selected-macros="updateSelectedMacros"
            />
            <DashboardChannelPointsCard v-else-if="entry.card.key === 'channel_points'" />
            <DashboardRotatingScenesCard v-else-if="entry.card.key === 'rotating_scenes'" />
            <DashboardYoloboxCard v-else-if="entry.card.key === 'yolobox'" />
            <DashboardAudioOutputsCard v-else-if="entry.card.key === 'audio_outputs'" />
            <DashboardBotAudioChannelsCard v-else-if="entry.card.key === 'bot_audio_channels'" />
            <DashboardCommandsCard v-else-if="entry.card.key === 'commands'" ref="dashboardCommandsCard" :selected-commands="dashboardLayout.command_names" @update:selected-commands="updateSelectedCommands" />
            <DashboardAudioPresetsCard v-else-if="entry.card.key === 'audio_presets'" />
            <DashboardObsScenesCard
              v-else-if="isObsSceneCard(entry.card.key)"
              :connection="obsConnectionFromKey(entry.card.key)"
            />
            <DashboardObsAudioCard
              v-else-if="isObsAudioCard(entry.card.key)"
              :connection="obsConnectionFromKey(entry.card.key)"
            />
            </div>
          </div>

        </template>

        <div
          v-if="editMode && column.length > 0"
          class="dashboard-drop-zone dashboard-drop-zone--end"
          :class="{ 'dashboard-drop-zone--active': isDropTarget(columnIndex, column.length) }"
          @dragenter.prevent="setDropTarget(columnIndex, column.length)"
          @dragover.prevent="setDropTarget(columnIndex, column.length)"
          @drop.stop="dropCardAt(columnIndex, column.length)"
          @click="openAddCardAt(columnIndex, column.length, $event)"
        >
          <template v-if="!draggedCard"><v-icon icon="mdi-plus" size="16" /><span>{{ $t('dashboard.customize.addCard') }}</span></template>
          <span v-else>{{ $t('dashboard.customize.dropHere') }}</span>
        </div>

        <div
          v-if="editMode && column.length === 0"
          class="dashboard-empty-column"
          :class="{ 'dashboard-empty-column--active': isDropTarget(columnIndex, 0) }"
          @dragenter.prevent="setDropTarget(columnIndex, 0)"
          @dragover.prevent="setDropTarget(columnIndex, 0)"
          @drop.stop="dropCardAt(columnIndex, 0)"
          @click="openAddCardAt(columnIndex, 0, $event)"
        >
          <v-icon :icon="draggedCard ? 'mdi-arrow-down-bold-outline' : 'mdi-plus'" size="20" />
          <span class="text-caption">{{ draggedCard ? $t('dashboard.customize.dropHere') : $t('dashboard.customize.addCard') }}</span>
        </div>
      </div>
    </div>

    <v-menu
      v-if="editMode"
      v-model="addCardMenuOpen"
      :target="[addCardMenuX, addCardMenuY]"
      location="bottom start"
      :close-on-content-click="false"
    >
      <v-list
        v-model:opened="addCardOpenedGroups"
        density="compact"
        min-width="280"
        open-strategy="multiple"
      >
        <v-list-item
          v-for="card in hiddenRegularCards"
          :key="card.key"
          :prepend-icon="cardIcon(card.key)"
          :title="cardLabel(card.key)"
          @click="showCardFromMenu(card.key)"
        />

        <v-list-group v-if="hiddenAudioCards.length" value="audio">
          <template #activator="{ props: groupProps }">
            <v-list-item v-bind="groupProps" prepend-icon="mdi-volume-high" :title="$t('dashboard.customize.groups.audio')" />
          </template>
          <v-list-item
            v-for="card in hiddenAudioCards"
            :key="card.key"
            :prepend-icon="cardIcon(card.key)"
            :title="cardLabel(card.key)"
            @click="showCardFromMenu(card.key)"
          />
        </v-list-group>

        <v-list-group v-if="hiddenObsGroups.length" value="obs">
          <template #activator="{ props: groupProps }">
            <v-list-item v-bind="groupProps" prepend-icon="mdi-video-outline" title="OBS" />
          </template>
          <v-list-group
            v-for="group in hiddenObsGroups"
            :key="group.connection"
            :value="`obs-${group.connection}`"
            subgroup
          >
            <template #activator="{ props: instanceProps }">
              <v-list-item v-bind="instanceProps" prepend-icon="mdi-access-point" :title="group.connection" />
            </template>
            <v-list-item
              v-for="card in group.cards"
              :key="card.key"
              :prepend-icon="cardIcon(card.key)"
              :title="isObsSceneCard(card.key) ? $t('dashboard.customize.cards.obs_scenes') : $t('dashboard.customize.cards.obs_audio')"
              @click="showCardFromMenu(card.key)"
            />
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-menu>

    <div v-if="editMode" class="dashboard-editor-floating">
      <v-card class="dashboard-editor-dock" elevation="8">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-restore"
            @click="resetDashboard"
          >
            {{ $t('dashboard.customize.reset') }}
          </v-btn>

          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-check"
            @click="setEditMode(false)"
          >
            {{ $t('dashboard.customize.done') }}
          </v-btn>
        </div>
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import Giveaway from '@/components/Giveaway.vue'
import MusicControls from '@/components/MusicControls.vue'
import InteractionQueue from '@/components/InteractionQueue.vue'
import DashboardMacrosCard from '@/components/cards/DashboardMacrosCard.vue'
import DashboardChannelPointsCard from '@/components/cards/DashboardChannelPointsCard.vue'
import DashboardRotatingScenesCard from '@/components/cards/DashboardRotatingScenesCard.vue'
import DashboardYoloboxCard from '@/components/cards/DashboardYoloboxCard.vue'
import DashboardAudioOutputsCard from '@/components/cards/DashboardAudioOutputsCard.vue'
import DashboardBotAudioChannelsCard from '@/components/cards/DashboardBotAudioChannelsCard.vue'
import DashboardObsScenesCard from '@/components/cards/DashboardObsScenesCard.vue'
import DashboardObsAudioCard from '@/components/cards/DashboardObsAudioCard.vue'
import DashboardCommandsCard from '@/components/cards/DashboardCommandsCard.vue'
import DashboardAudioPresetsCard from '@/components/cards/DashboardAudioPresetsCard.vue'
import { getWebsocketClient } from '@/plugins/websocketInstance'
import eventBus from '@/eventBus.js'

type DashboardCardKey = string

type DashboardSection = {
  key: DashboardCardKey
  visible: boolean
  column: number
  order: number
}

type DashboardLayout = {
  version: number
  sections: DashboardSection[]
  macro_names: string[]
  command_names: string[]
}

const DASHBOARD_VERSION = 14

const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  version: DASHBOARD_VERSION,
  macro_names: [],
  command_names: [],
  sections: [
    { key: 'interactions', visible: true, column: 0, order: 0 },
    { key: 'auto_macros', visible: true, column: 0, order: 1 },
    { key: 'giveaway', visible: true, column: 1, order: 0 },
    { key: 'music', visible: true, column: 2, order: 0 },
    { key: 'macros', visible: false, column: 0, order: 2 },
    { key: 'channel_points', visible: false, column: 1, order: 1 },
    { key: 'rotating_scenes', visible: false, column: 0, order: 3 },
    { key: 'yolobox', visible: false, column: 1, order: 2 },
    { key: 'audio_outputs', visible: false, column: 2, order: 1 },
    { key: 'bot_audio_channels', visible: false, column: 2, order: 2 },
    { key: 'commands', visible: false, column: 1, order: 3 },
    { key: 'audio_presets', visible: false, column: 2, order: 3 },
  ],
}

const STATIC_CARD_KEYS: DashboardCardKey[] = ['giveaway', 'interactions', 'auto_macros', 'music', 'macros', 'channel_points', 'rotating_scenes', 'yolobox', 'audio_outputs', 'bot_audio_channels', 'commands', 'audio_presets']

function cloneDefaultLayout(): DashboardLayout {
  return JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT))
}

export default {
  components: {
    Giveaway,
    MusicControls,
    InteractionQueue,
    DashboardMacrosCard,
    DashboardChannelPointsCard,
    DashboardRotatingScenesCard,
    DashboardYoloboxCard,
    DashboardAudioOutputsCard,
    DashboardBotAudioChannelsCard,
    DashboardObsScenesCard,
    DashboardObsAudioCard,
    DashboardCommandsCard,
    DashboardAudioPresetsCard,
  },

  data() {
    return {
      editMode: false,
      dashboardLayout: cloneDefaultLayout() as DashboardLayout,
      draggedCard: '' as DashboardCardKey | '',
      dropTargetColumn: -1,
      dropTargetIndex: -1,
      saveTimer: null as ReturnType<typeof setTimeout> | null,
      applyingRemoteLayout: false,
      dashboardColumnCount: 3,
      dashboardResizeObserver: null as ResizeObserver | null,
      dropTargetRaf: 0 as number,
      pendingDropTarget: null as null | { column: number; index: number },
      addCardMenuOpen: false,
      addCardOpenedGroups: [] as string[],
      addCardInsertTarget: null as null | { column: number; index: number },
      addCardMenuX: 0,
      addCardMenuY: 0,
    }
  },

  computed: {
    ...mapState(useAppStore, ['getAutoMacros', 'getSettings', 'getIntegrations', 'getObsSceneDataByConnection', 'getObsAudioDataByConnection']),

    obsConnectionNames(): string[] {
      const names = new Set<string>()
      const integrations: any = this.getIntegrations ?? {}
      const obs = integrations?.obs
      if (obs && typeof obs === 'object' && !Array.isArray(obs)) {
        Object.keys(obs).forEach(name => names.add(String(name)))
      }
      Object.keys((this.getObsSceneDataByConnection as any) ?? {}).forEach(name => names.add(String(name)))
      Object.keys((this.getObsAudioDataByConnection as any) ?? {}).forEach(name => names.add(String(name)))
      return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b))
    },

    obsConnectionSignature(): string {
      return this.obsConnectionNames.join('\u0000')
    },

    allCardKeys(): string[] {
      return [
        ...STATIC_CARD_KEYS,
        ...this.obsConnectionNames.flatMap(name => [`obs_scene:${name}`, `obs_audio:${name}`]),
      ]
    },

    visibleCards(): DashboardSection[] {
      return this.dashboardLayout.sections.filter((section: DashboardSection) => section.visible).sort((a, b) => a.order - b.order)
    },

    hiddenCards(): DashboardSection[] {
      return this.dashboardLayout.sections.filter((section: DashboardSection) => !section.visible).sort((a, b) => a.order - b.order)
    },

    hiddenAudioCards(): DashboardSection[] {
      return this.hiddenCards.filter(card => ['audio_outputs', 'bot_audio_channels', 'audio_presets'].includes(card.key))
    },

    hiddenRegularCards(): DashboardSection[] {
      return this.hiddenCards.filter(card => !this.isObsSceneCard(card.key) && !this.isObsAudioCard(card.key) && !['audio_outputs', 'bot_audio_channels', 'audio_presets'].includes(card.key))
    },

    hiddenObsGroups(): Array<{ connection: string; cards: DashboardSection[] }> {
      return this.obsConnectionNames
        .map(connection => ({
          connection,
          cards: this.hiddenCards.filter(card => [
            `obs_scene:${connection}`,
            `obs_audio:${connection}`,
          ].includes(card.key)),
        }))
        .filter(group => group.cards.length > 0)
    },

    dashboardColumns(): Array<Array<{ card: DashboardSection; columnIndex: number }>> {
      const count = Math.max(1, Math.min(3, this.dashboardColumnCount))
      const columns = Array.from({ length: count }, () => [] as Array<{ card: DashboardSection; columnIndex: number }>)

      for (const card of this.visibleCards) {
        const column = Math.min(Math.max(0, card.column), count - 1)
        columns[column].push({ card, columnIndex: columns[column].length })
      }

      return columns
    },

    localAdminDashboardSetting(): any {
      return (this.getSettings as any)?.local_admin_panel?.dashboard ?? null
    },
  },

  watch: {
    obsConnectionSignature() {
      this.syncDynamicCards()
    },
    localAdminDashboardSetting: {
      deep: true,
      immediate: true,
      handler(value: any) {
        this.applySavedLayout(value)
      },
    },
  },

  mounted() {
    void this.loadSettings()
    eventBus.$on('dashboard:toggle-edit', this.toggleEditMode)
    eventBus.$on('dashboard:set-edit', this.setEditMode)
    this.$nextTick(() => {
      this.startDashboardResizeObserver()
      this.syncDynamicCards()
    })
  },

  beforeUnmount() {
    eventBus.$emit('dashboard:edit-state', false)
    eventBus.$off('dashboard:toggle-edit', this.toggleEditMode)
    eventBus.$off('dashboard:set-edit', this.setEditMode)
    this.dashboardResizeObserver?.disconnect()
    this.dashboardResizeObserver = null
    if (this.dropTargetRaf) cancelAnimationFrame(this.dropTargetRaf)
    this.dropTargetRaf = 0
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
  },

  methods: {
    setEditMode(enabled: boolean) {
      this.editMode = Boolean(enabled)
      if (!this.editMode) this.endDrag()
      eventBus.$emit('dashboard:edit-state', this.editMode)
    },

    toggleEditMode() {
      this.setEditMode(!this.editMode)
    },

    openMacrosPicker() {
      const ref: any = this.$refs.dashboardMacrosCard
      const component = Array.isArray(ref) ? ref[0] : ref
      component?.openPicker?.()
    },

    openCommandsPicker() {
      const ref: any = this.$refs.dashboardCommandsCard
      const component = Array.isArray(ref) ? ref[0] : ref
      component?.openPicker?.()
    },

    cardLabel(key: DashboardCardKey) {
      if (key === 'rotating_scenes') {
        return String(this.$t('rotatingScenes.headerTitle'))
      }
      if (this.isObsSceneCard(key)) {
        return `${this.$t('dashboard.customize.cards.obs_scenes')} — ${this.obsConnectionFromKey(key)}`
      }
      if (this.isObsAudioCard(key)) {
        return `${this.$t('dashboard.customize.cards.obs_audio')} — ${this.obsConnectionFromKey(key)}`
      }
      return String(this.$t(`dashboard.customize.cards.${key}`))
    },

    cardIcon(key: DashboardCardKey) {
      if (this.isObsSceneCard(key)) return 'mdi-video-switch-outline'
      if (this.isObsAudioCard(key)) return 'mdi-tune-vertical'
      const icons: Record<string, string> = {
        giveaway: 'mdi-gift-outline',
        interactions: 'mdi-format-list-bulleted-square',
        auto_macros: 'mdi-auto-mode',
        music: 'mdi-music',
        macros: 'mdi-code-braces',
        channel_points: 'mdi-star-circle-outline',
        rotating_scenes: 'mdi-filmstrip',
        yolobox: 'mdi-video-wireless-outline',
        audio_outputs: 'mdi-volume-high',
        bot_audio_channels: 'mdi-waveform',
        commands: 'mdi-console-line',
        audio_presets: 'mdi-tune-variant',
      }
      return icons[key] ?? 'mdi-view-dashboard-outline'
    },

    isObsSceneCard(key: string) { return String(key).startsWith('obs_scene:') },
    isObsAudioCard(key: string) { return String(key).startsWith('obs_audio:') },
    obsConnectionFromKey(key: string) { return String(key).split(':').slice(1).join(':') || 'default' },

    syncDynamicCards() {
      const allowed = new Set(this.allCardKeys)
      const next = this.dashboardLayout.sections.filter(section => allowed.has(section.key))
      let changed = next.length !== this.dashboardLayout.sections.length

      for (const key of this.allCardKeys) {
        if (next.some(section => section.key === key)) continue
        next.push({ key, visible: false, column: 2, order: next.length })
        changed = true
      }

      if (!changed) return
      this.dashboardLayout.sections = next
      this.reindexLayout()
    },

    normalizeLayout(raw: any): DashboardLayout {
      if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections)) {
        return cloneDefaultLayout()
      }

      const sourceSections = raw.sections as any[]
      const hasColumns = sourceSections.some(section => Number.isFinite(Number(section?.column)))
      const normalizedSections: DashboardSection[] = []

      const sourceObsKeys = sourceSections
        .map(section => String(section?.key ?? ''))
        .filter(key => this.isObsSceneCard(key) || this.isObsAudioCard(key))
      const normalizedKeys = Array.from(new Set([...this.allCardKeys, ...sourceObsKeys]))

      for (const key of normalizedKeys) {
        const fallback = DEFAULT_DASHBOARD_LAYOUT.sections.find(section => section.key === key)
          ?? { key, visible: false, column: 2, order: normalizedSections.length }
        const source = sourceSections.find(section => section?.key === key)

        if (source && hasColumns) {
          normalizedSections.push({
            key,
            visible: source.visible !== false,
            column: Math.max(0, Math.min(2, Math.floor(Number(source.column) || 0))),
            order: Number.isFinite(Number(source.order)) ? Math.max(0, Math.floor(Number(source.order))) : fallback.order,
          })
          continue
        }

        // v6 used a single fluid order. Restore that order into independent
        // three-column slots (0,1,2,0,1,2...) so existing custom ordering survives.
        if (source) {
          const globalOrder = Number.isFinite(Number(source.order)) ? Math.max(0, Math.floor(Number(source.order))) : fallback.order
          normalizedSections.push({
            key,
            visible: source.visible !== false,
            column: globalOrder % 3,
            order: Math.floor(globalOrder / 3),
          })
          continue
        }

        normalizedSections.push({ ...fallback })
      }

      if (!normalizedSections.some(section => section.visible)) normalizedSections[0].visible = true

      const macroNames = Array.isArray(raw.macro_names)
        ? Array.from(new Set(raw.macro_names
          .map((name: any) => String(name ?? '').trim())
          .filter((name: string) => name && !['event_', 'channel_point_', 'command_'].some(prefix => name.toLowerCase().startsWith(prefix)))))
        : []

      const commandNames = Array.isArray(raw.command_names)
        ? Array.from(new Set(raw.command_names.map((name: any) => String(name ?? '').trim()).filter(Boolean)))
        : []

      const layout: DashboardLayout = { version: DASHBOARD_VERSION, sections: normalizedSections, macro_names: macroNames, command_names: commandNames }
      this.reindexLayout(layout)
      return layout
    },

    reindexLayout(layout = this.dashboardLayout) {
      for (let column = 0; column < 3; column++) {
        layout.sections
          .filter(section => section.column === column)
          .sort((a, b) => a.order - b.order)
          .forEach((section, index) => { section.order = index })
      }
    },

    startDashboardResizeObserver() {
      const board = this.$refs.dashboardBoard as HTMLElement | undefined
      if (!board || typeof ResizeObserver === 'undefined') {
        this.updateDashboardColumnCount(board?.clientWidth ?? window.innerWidth)
        return
      }

      this.dashboardResizeObserver?.disconnect()
      this.dashboardResizeObserver = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect?.width ?? board.clientWidth
        this.updateDashboardColumnCount(width)
      })
      this.dashboardResizeObserver.observe(board)
      this.updateDashboardColumnCount(board.clientWidth)
    },

    updateDashboardColumnCount(width: number) {
      const next = width >= 1320 ? 3 : width >= 760 ? 2 : 1
      if (next !== this.dashboardColumnCount) this.dashboardColumnCount = next
    },

    applySavedLayout(value: any) {
      if (this.applyingRemoteLayout) return
      this.dashboardLayout = this.normalizeLayout(value)
    },

    startDrag(key: DashboardCardKey, event: DragEvent) {
      if (!this.editMode) {
        event.preventDefault()
        return
      }

      this.draggedCard = key
      this.dropTargetColumn = -1
      this.dropTargetIndex = -1

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', key)

        const dragBar = event.currentTarget as HTMLElement | null
        if (dragBar) {
          const rect = dragBar.getBoundingClientRect()
          event.dataTransfer.setDragImage(dragBar, Math.min(48, rect.width / 2), Math.min(20, rect.height / 2))
        }
      }
    },

    setDropTarget(column: number, index: number) {
      if (!this.draggedCard) return
      if (this.dropTargetColumn === column && this.dropTargetIndex === index) return
      if (this.pendingDropTarget?.column === column && this.pendingDropTarget?.index === index) return
      this.pendingDropTarget = { column, index }
      if (this.dropTargetRaf) return
      this.dropTargetRaf = requestAnimationFrame(() => {
        this.dropTargetRaf = 0
        const target = this.pendingDropTarget
        this.pendingDropTarget = null
        if (!target || !this.draggedCard) return
        this.dropTargetColumn = target.column
        this.dropTargetIndex = target.index
      })
    },


    isDropTarget(column: number, index: number) {
      return Boolean(this.draggedCard) && this.dropTargetColumn === column && this.dropTargetIndex === index
    },

    endDrag() {
      this.draggedCard = ''
      this.dropTargetColumn = -1
      this.dropTargetIndex = -1
      this.pendingDropTarget = null
      if (this.dropTargetRaf) cancelAnimationFrame(this.dropTargetRaf)
      this.dropTargetRaf = 0
    },

    dropCardAt(targetColumn: number, targetIndex: number) {
      const key = this.draggedCard
      if (!key) return

      const section = this.dashboardLayout.sections.find(item => item.key === key)
      if (!section) {
        this.endDrag()
        return
      }

      const visibleColumnCount = Math.max(1, Math.min(3, this.dashboardColumnCount))
      const target = Math.max(0, Math.min(visibleColumnCount - 1, targetColumn))
      const sourceDisplayColumn = Math.min(section.column, visibleColumnCount - 1)
      const sourceColumnEntries = this.dashboardColumns[sourceDisplayColumn] ?? []
      const sourceIndex = sourceColumnEntries.findIndex(entry => entry.card.key === key)

      // Drop-zone indexes are based on the column before the source is removed.
      // Compensate when moving down inside the same displayed column so the card
      // lands exactly at the highlighted insertion point.
      let insertAt = Math.max(0, targetIndex)
      if (sourceDisplayColumn === target && sourceIndex >= 0 && insertAt > sourceIndex) {
        insertAt--
      }

      const targetEntries = (this.dashboardColumns[target] ?? [])
        .filter(entry => entry.card.key !== key)
        .map(entry => entry.card)

      insertAt = Math.min(insertAt, targetEntries.length)

      // A drop into another visible column makes that the card's persisted logical column.
      // On responsive 1/2-column views, cards from hidden logical columns stay mapped into
      // the last visible column until the user explicitly moves them.
      if (sourceDisplayColumn !== target || section.column < visibleColumnCount) {
        section.column = target
      }
      section.visible = true

      targetEntries.splice(insertAt, 0, section)
      targetEntries.forEach((item, index) => {
        if (item.key === key || item.column === target) {
          item.column = target
          item.order = index
        }
      })

      this.reindexLayout()
      this.endDrag()
      this.queueSaveLayout()
    },

    hideCard(key: DashboardCardKey) {
      if (this.visibleCards.length <= 1) return
      const section = this.dashboardLayout.sections.find(item => item.key === key)
      if (!section) return
      section.visible = false
      this.reindexLayout()
      this.queueSaveLayout()
    },

    openAddCardAt(column: number, index: number, event?: MouseEvent) {
      if (this.draggedCard || this.hiddenCards.length === 0) return
      this.addCardInsertTarget = { column, index }
      this.addCardOpenedGroups = []
      this.addCardMenuX = Number(event?.clientX ?? 0)
      this.addCardMenuY = Number(event?.clientY ?? 0)
      // Re-open at the newly clicked slot even when the previous context menu was open.
      this.addCardMenuOpen = false
      this.$nextTick(() => { this.addCardMenuOpen = true })
    },

    showCardFromMenu(key: DashboardCardKey) {
      this.showCard(key, this.addCardInsertTarget)
      this.addCardInsertTarget = null
      this.addCardMenuOpen = false
      this.addCardOpenedGroups = []
    },

    showCard(key: DashboardCardKey, insertTarget: null | { column: number; index: number } = null) {
      const section = this.dashboardLayout.sections.find(item => item.key === key)
      if (!section) return

      const counts = Array.from({ length: this.dashboardColumnCount }, (_, column) =>
        this.visibleCards.filter(item => Math.min(item.column, this.dashboardColumnCount - 1) === column).length,
      )
      const targetColumn = insertTarget
        ? Math.max(0, Math.min(this.dashboardColumnCount - 1, insertTarget.column))
        : counts.indexOf(Math.min(...counts))

      section.visible = true
      section.column = targetColumn
      if (insertTarget) {
        const targetEntries = this.dashboardLayout.sections
          .filter(item => item.visible && item.key !== key && Math.min(item.column, this.dashboardColumnCount - 1) === targetColumn)
          .sort((a, b) => a.order - b.order)
        const insertAt = Math.max(0, Math.min(insertTarget.index, targetEntries.length))
        targetEntries.splice(insertAt, 0, section)
        targetEntries.forEach((item, index) => { item.column = targetColumn; item.order = index })
      } else {
        section.order = counts[targetColumn]
      }
      this.reindexLayout()
      this.queueSaveLayout()
    },

    updateSelectedMacros(names: string[]) {
      this.dashboardLayout.macro_names = Array.from(new Set((names ?? [])
        .map(name => String(name ?? '').trim())
        .filter(name => name && !['event_', 'channel_point_', 'command_'].some(prefix => name.toLowerCase().startsWith(prefix)))))
      this.queueSaveLayout()
    },

    resetDashboard() {
      this.dashboardLayout = cloneDefaultLayout()
      this.queueSaveLayout(true)
    },

    updateSelectedCommands(names: string[]) {
      this.dashboardLayout.command_names = Array.from(new Set((names ?? []).map(name => String(name ?? '').trim()).filter(Boolean)))
      this.queueSaveLayout()
    },

    queueSaveLayout(immediate = false) {
      if (this.saveTimer) clearTimeout(this.saveTimer)

      if (immediate) {
        this.saveTimer = null
        void this.saveLayout()
        return
      }

      this.saveTimer = setTimeout(() => {
        this.saveTimer = null
        void this.saveLayout()
      }, 250)
    },

    async saveLayout() {
      const client: any = getWebsocketClient()
      if (!client?.request) return

      this.reindexLayout()
      const dashboard = JSON.parse(JSON.stringify(this.dashboardLayout))

      try {
        this.applyingRemoteLayout = true
        await client.request('settings_save', {
          local_admin_panel: {
            dashboard,
          },
        }, 10_000)

        const store = useAppStore()
        const currentSettings: any = store.getSettings ?? {}
        store.setSettings({
          ...currentSettings,
          local_admin_panel: {
            ...(currentSettings.local_admin_panel ?? {}),
            dashboard,
          },
        })
      } catch (error) {
        console.error('saving dashboard layout failed', error)
      } finally {
        this.applyingRemoteLayout = false
      }
    },

    async loadSettings() {
      const client: any = getWebsocketClient()
      if (!client?.request) return

      try {
        const response = await client.request('settings_get', {}, 8_000)
        const key = 'result_settings_get'
        const containers = [response, response?.params, response?.data, response?.result, response?.payload].filter(Boolean)
        let settings: any = null

        for (const container of containers) {
          if (container && typeof container === 'object' && Object.prototype.hasOwnProperty.call(container, key)) {
            settings = container[key]
            break
          }
        }

        settings = settings?.settings ?? settings?.data ?? settings
        if (!settings || typeof settings !== 'object') return

        useAppStore().setSettings(settings)
      } catch (error) {
        console.debug('loading dashboard settings failed', error)
      }
    },
  },
}
</script>

<style lang="scss">
.dashboard-layout {
  display: grid;
  grid-template-columns: repeat(var(--dashboard-columns, 1), minmax(0, 1fr));
  gap: 16px;
  align-items: start;
  padding: 20px 0 16px;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.dashboard-column--editing {
  min-height: 180px;
  border-radius: 12px;
  gap: 0;
}


.dashboard-drop-zone {
  height: 22px;
  min-height: 22px;
  flex: 0 0 22px;
  margin: 0;
  box-sizing: border-box;
  border: 1px dashed rgba(var(--v-theme-primary), .32);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), .42);
  background: rgba(var(--v-theme-primary), .035);
  overflow: hidden;
  transition: height 110ms ease, min-height 110ms ease, flex-basis 110ms ease, background 90ms ease, border-color 90ms ease, color 90ms ease;
}
.dashboard-drop-zone { cursor: pointer; gap: 4px; }
.dashboard-drop-zone > span { font-size: 11px; pointer-events: none; opacity: .55; transition: opacity 90ms ease; }
.dashboard-drop-zone:hover,
.dashboard-drop-zone--active {
  height: 44px;
  min-height: 44px;
  flex-basis: 44px;
  border-color: rgba(var(--v-theme-primary), .85);
  background: rgba(var(--v-theme-primary), .12);
  color: rgba(var(--v-theme-on-surface), .82);
}
.dashboard-drop-zone:hover > span,
.dashboard-drop-zone--active > span { opacity: 1; }
.dashboard-drop-zone:hover > .v-icon, .dashboard-drop-zone--active > .v-icon { opacity: 1; }
.dashboard-drop-zone--end { margin-top: 0; }

.dashboard-empty-column {
  display: flex;
  min-height: 100px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.45);
  border-radius: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.dashboard-card-shell {
  position: relative;
  min-width: 0;
}

.dashboard-card-shell--editing {
  border: 1px dashed rgba(var(--v-theme-primary), 0.7);
  border-radius: 12px;
  padding: 12px 8px;
  background: rgba(var(--v-theme-surface), 0.28);
  cursor: grab;
}

.dashboard-card-shell--editing:active {
  cursor: grabbing;
}

.dashboard-layout--editing .dashboard-card-content {
  pointer-events: none;
}


.dashboard-empty-column--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.dashboard-card-shell--dragging {
  opacity: 0.38;
}

.dashboard-card-editor-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  margin: -2px -2px 8px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.08);
  cursor: grab;
  user-select: none;
}

.dashboard-card-editor-bar:active {
  cursor: grabbing;
}

.dashboard-card-drag-area {
  flex: 1 1 auto;
  min-height: 28px;
}

.dashboard-drag-hint {
  opacity: 0;
  transition: opacity 120ms ease;
}

.dashboard-card-editor-bar:hover .dashboard-drag-hint {
  opacity: 0.7;
}


.dashboard-editor-floating {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
}

.dashboard-editor-dock {
  max-width: min(760px, calc(100vw - 32px));
  padding: 10px;
  background: rgba(var(--v-theme-surface), 0.96);
  backdrop-filter: blur(10px);
}

.min-width-0 {
  min-width: 0;
}


@media (max-width: 959px) {
  .dashboard-editor-floating {
    right: 16px;
    bottom: 16px;
  }
}
</style>

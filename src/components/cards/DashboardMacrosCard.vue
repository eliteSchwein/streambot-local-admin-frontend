<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-code-braces" />
        {{ $t('dashboard.customize.cards.macros') }}
      </v-toolbar-title>

    </v-toolbar>

    <v-card-text class="pt-3">
      <template v-if="selectedMacroList.length === 0">
        <v-alert
          type="info"
          color="grey-darken-3"
          density="compact"
          :text="$t('dashboard.customize.noMacrosSelected')"
          class="mb-3"
        />

      </template>

      <template v-else>
        <v-text-field
          v-model="searchQuery"
          :label="$t('dashboard.customize.macroSearch')"
          prepend-inner-icon="mdi-magnify"
          clearable
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
        />

        <v-alert
          v-if="filteredMacros.length === 0"
          type="info"
          color="grey-darken-3"
          density="compact"
          :text="$t('dashboard.customize.noMacros')"
        />

        <div v-else class="dashboard-macro-list">
          <div
            v-for="item in filteredMacros"
            :key="item.name"
            class="dashboard-macro-row"
          >
            <div class="text-truncate min-width-0" :title="item.name">
              {{ item.name }}
            </div>

            <v-btn
              icon="mdi-play"
              size="small"
              variant="tonal"
              color="success"
              :loading="runningMacro === item.name"
              :disabled="Boolean(runningMacro)"
              @click="runMacro(item.name)"
            />
          </div>
        </div>
      </template>
    </v-card-text>

    <v-dialog v-model="pickerDialog" max-width="620">
      <v-card>
        <v-toolbar flat density="compact">
          <v-toolbar-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-tune-variant" />
            {{ $t('dashboard.customize.selectMacros') }}
          </v-toolbar-title>
          <v-btn icon="mdi-close" variant="text" @click="pickerDialog = false" />
        </v-toolbar>

        <v-card-text>
          <v-text-field
            v-model="pickerSearch"
            :label="$t('dashboard.customize.macroPickerSearch')"
            prepend-inner-icon="mdi-magnify"
            clearable
            variant="outlined"
            density="compact"
            hide-details
            class="mb-3"
          />

          <div class="d-flex align-center justify-space-between ga-3 mb-2 flex-wrap">
            <div class="text-caption text-medium-emphasis">
              {{ $t('dashboard.customize.selectedMacroCount', { count: pickerSelection.length }) }}
            </div>
            <v-btn
              size="small"
              variant="text"
              prepend-icon="mdi-selection-remove"
              :disabled="pickerSelection.length === 0"
              @click="pickerSelection = []"
            >
              {{ $t('dashboard.customize.clearMacroSelection') }}
            </v-btn>
          </div>

          <v-alert
            v-if="pickerMacroList.length === 0"
            type="info"
            color="grey-darken-3"
            density="compact"
            :text="$t('dashboard.customize.noMacros')"
          />

          <v-list v-else density="compact" class="dashboard-macro-picker-list">
            <v-list-item
              v-for="item in pickerMacroList"
              :key="item.name"
              :title="item.name"
              @click="togglePickerMacro(item.name)"
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="pickerSelection.includes(item.name)"
                  @click.stop="togglePickerMacro(item.name)"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pickerDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-content-save" @click="savePicker">
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'

type MacroEntry = {
  name: string
  macro: any
}

const HIDDEN_MACRO_PREFIXES = ['event_', 'channel_point_', 'command_']

export default {
  name: 'DashboardMacrosCard',

  props: {
    selectedMacros: {
      type: Array as () => string[],
      default: () => [],
    },
  },

  emits: ['update:selectedMacros'],

  data() {
    return {
      searchQuery: '',
      runningMacro: '',
      pickerDialog: false,
      pickerSearch: '',
      pickerSelection: [] as string[],
    }
  },

  computed: {
    ...mapState(useAppStore, ['getMacros', 'getRestApi']),

    macroList(): MacroEntry[] {
      return Object.entries(this.getMacros ?? {})
        .map(([name, macro]) => ({ name, macro }))
        .filter(item => !this.isHiddenMacro(item.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    selectedMacroList(): MacroEntry[] {
      const selected = new Set(
        (this.selectedMacros ?? [])
          .map(name => String(name ?? '').trim())
          .filter(name => name && !this.isHiddenMacro(name)),
      )

      return this.macroList.filter(item => selected.has(item.name))
    },

    filteredMacros(): MacroEntry[] {
      const query = String(this.searchQuery ?? '').trim().toLowerCase()
      if (!query) return this.selectedMacroList
      return this.selectedMacroList.filter(item => item.name.toLowerCase().includes(query))
    },

    pickerMacroList(): MacroEntry[] {
      const query = String(this.pickerSearch ?? '').trim().toLowerCase()
      if (!query) return this.macroList
      return this.macroList.filter(item => item.name.toLowerCase().includes(query))
    },
  },

  methods: {
    isHiddenMacro(name: string) {
      const normalized = String(name ?? '').trim().toLowerCase()
      return HIDDEN_MACRO_PREFIXES.some(prefix => normalized.startsWith(prefix))
    },

    openPicker() {
      const available = new Set(this.macroList.map(item => item.name))
      this.pickerSelection = (this.selectedMacros ?? [])
        .map(name => String(name ?? '').trim())
        .filter(name => available.has(name) && !this.isHiddenMacro(name))
      this.pickerSearch = ''
      this.pickerDialog = true
    },

    togglePickerMacro(name: string) {
      if (!name || this.isHiddenMacro(name)) return
      const index = this.pickerSelection.indexOf(name)
      if (index >= 0) this.pickerSelection.splice(index, 1)
      else this.pickerSelection.push(name)
    },

    savePicker() {
      const available = new Set(this.macroList.map(item => item.name))
      const selection = Array.from(new Set(this.pickerSelection))
        .filter(name => available.has(name) && !this.isHiddenMacro(name))
        .sort((a, b) => a.localeCompare(b))

      this.$emit('update:selectedMacros', selection)
      this.pickerDialog = false
    },

    async runMacro(name: string) {
      if (!name || this.runningMacro || this.isHiddenMacro(name)) return
      this.runningMacro = name

      try {
        await fetch(`${this.getRestApi}/api/macro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ macro: name }),
        })
      } finally {
        this.runningMacro = ''
      }
    },
  },
}
</script>

<style scoped lang="scss">
.dashboard-macro-list,
.dashboard-macro-picker-list {
  max-height: 360px;
  overflow-y: auto;
}

.dashboard-macro-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 6px 4px 6px 10px;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.dashboard-macro-row:last-child {
  border-bottom: 0;
}

.min-width-0 {
  min-width: 0;
}
</style>

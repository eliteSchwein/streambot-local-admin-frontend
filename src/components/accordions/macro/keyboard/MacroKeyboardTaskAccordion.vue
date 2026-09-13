<template>
  <MacroTaskAccordionTemplate
    class="macro-keyboard-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-keyboard-outline"
    :title="$t('macro.core.keyboard.label')"
    :detail="keyboardTitleDetail"
    export-prefix="macro_keyboard"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="keyboardData.name"
          :label="$t('macro.core.keyboard.name')"
          :placeholder="$t('macro.core.keyboard.macro')"
          density="comfortable"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" sm="8" md="4">
        <v-number-input
          v-model="durationValue"
          :label="$t('macro.core.keyboard.duration')"
          density="comfortable"
          variant="outlined"
          hide-details
          :min="0"
          :step="0.1"
          @update:model-value="saveDuration"
        />
      </v-col>

      <v-col cols="12" sm="4" md="2">
        <v-select
          v-model="durationUnit"
          :items="timeUnits"
          item-title="title"
          item-value="value"
          :label="$t('macro.common.timeUnit')"
          density="comfortable"
          variant="outlined"
          hide-details
          @update:model-value="saveDuration"
        />
      </v-col>

      <v-col cols="12">
        <div class="d-flex align-center mb-3 ga-2">
          <div class="text-subtitle-2">{{ $t('macro.core.keyboard.keyPress') }}</div>
          <v-spacer />

          <v-btn
            size="small"
            variant="tonal"
            :color="recordingKeys ? 'error' : undefined"
            :prepend-icon="recordingKeys ? 'mdi-stop-circle-outline' : 'mdi-record-circle-outline'"
            @click.prevent.stop="toggleKeyRecording"
          >
            {{ recordingKeys ? $t('macro.core.keyboard.stopRecording') : $t('macro.core.keyboard.recordKeyPress') }}
          </v-btn>

          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-close"
            @click="clearKeys"
          >
            {{ $t('macro.core.keyboard.clear') }}
          </v-btn>
        </div>

        <v-alert
          v-if="recordingKeys"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="mb-3"
        >
          {{ $t('macro.core.keyboard.pressAllKeysYouWantThenClick') }} <strong>{{ $t('macro.core.keyboard.stopRecording') }}</strong>.
        </v-alert>

        <div class="keyboard-shell">
          <div class="keyboard-layout">
            <div class="keyboard-main">
              <div
                v-for="(row, rowIndex) in mainKeyboardRows"
                :key="`main-${rowIndex}`"
                class="keyboard-row"
              >
                <button
                  v-for="(key, keyIndex) in row"
                  :key="`${rowIndex}-${keyIndex}-${key.value}`"
                  type="button"
                  :class="[
                    'keyboard-key',
                    `keyboard-key--${key.size || 'normal'}`,
                    isKeySelected(key.value) ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey(key.value)"
                >
                  {{ key.label }}
                </button>
              </div>
            </div>

            <div class="keyboard-side">
              <div class="keyboard-side-row">
                <button
                  v-for="key in systemKeys"
                  :key="key.value"
                  type="button"
                  :class="[
                    'keyboard-key',
                    'keyboard-key--side',
                    isKeySelected(key.value) ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey(key.value)"
                >
                  {{ key.label }}
                </button>
              </div>

              <div class="keyboard-arrow-grid">
                <div />

                <button
                  type="button"
                  :class="[
                    'keyboard-key',
                    'keyboard-key--side',
                    isKeySelected('UP') ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey('UP')"
                >
                  ↑
                </button>

                <div />

                <button
                  type="button"
                  :class="[
                    'keyboard-key',
                    'keyboard-key--side',
                    isKeySelected('LEFT') ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey('LEFT')"
                >
                  ←
                </button>

                <button
                  type="button"
                  :class="[
                    'keyboard-key',
                    'keyboard-key--side',
                    isKeySelected('DOWN') ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey('DOWN')"
                >
                  ↓
                </button>

                <button
                  type="button"
                  :class="[
                    'keyboard-key',
                    'keyboard-key--side',
                    isKeySelected('RIGHT') ? 'keyboard-key--active' : '',
                  ]"
                  @click="toggleKey('RIGHT')"
                >
                  →
                </button>
              </div>
            </div>

            <div class="keyboard-numpad">
              <button
                v-for="key in numpadKeys"
                :key="key.value"
                type="button"
                :class="[
                  'keyboard-key',
                  'keyboard-key--numpad',
                  key.size ? `keyboard-key--numpad-${key.size}` : '',
                  isKeySelected(key.value) ? 'keyboard-key--active' : '',
                ]"
                @click="toggleKey(key.value)"
              >
                {{ key.label }}
              </button>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours'

const UNIT_TO_SECONDS: Record<TimeUnit, number> = {
  milliseconds: 0.001,
  seconds: 1,
  minutes: 60,
  hours: 3600,
}

export default {
  name: 'MacroKeyboardTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      recordingKeys: false,
      pressedKeys: new Set<string>(),
      keyRecorderCleanup: null as null | (() => void),
      durationValue: 0,
      durationUnit: 'seconds' as TimeUnit,
    }
  },

  computed: {
    task(): any {
      const task = (this.item as any).task

      task.channel = 'keyboard'
      task.method = 'press'
      task.data ??= {}
      task.data.name ??= 'macro'

      if (!Array.isArray(task.data.keys)) {
        task.data.keys = []
      }

      if (Array.isArray(task.data.keys[0])) {
        task.data.keys = task.data.keys[0]
      }

      task.data.keys = task.data.keys
        .map((key: any) => String(key).trim())
        .filter(Boolean)

      return task
    },

    keyboardData(): any {
      return this.task.data
    },

    selectedKeys(): string[] {
      return this.keyboardData.keys
    },

    timeUnits(): Array<{ title: string; value: TimeUnit }> {
      return [
        { title: String(this.$t('macro.common.timeUnits.milliseconds')), value: 'milliseconds' },
        { title: String(this.$t('macro.common.timeUnits.seconds')), value: 'seconds' },
        { title: String(this.$t('macro.common.timeUnits.minutes')), value: 'minutes' },
        { title: String(this.$t('macro.common.timeUnits.hours')), value: 'hours' },
      ]
    },

    keyboardTitleDetail(): string {
      const keys = this.formatKeyPress(this.selectedKeys)
      const duration = this.formatDurationSeconds(this.getDurationSeconds())
      return [keys, duration].filter(Boolean).join(' · ')
    },

    mainKeyboardRows(): any[] {
      return [
        [
          { label: this.keyLabel('escape', 'Esc'), value: 'ESC' },
          { label: 'F1', value: 'F1' },
          { label: 'F2', value: 'F2' },
          { label: 'F3', value: 'F3' },
          { label: 'F4', value: 'F4' },
          { label: 'F5', value: 'F5' },
          { label: 'F6', value: 'F6' },
          { label: 'F7', value: 'F7' },
          { label: 'F8', value: 'F8' },
          { label: 'F9', value: 'F9' },
          { label: 'F10', value: 'F10' },
          { label: 'F11', value: 'F11' },
          { label: 'F12', value: 'F12' },
        ],
        [
          { label: 'F13', value: 'F13', size: 'fkey' },
          { label: 'F14', value: 'F14', size: 'fkey' },
          { label: 'F15', value: 'F15', size: 'fkey' },
          { label: 'F16', value: 'F16', size: 'fkey' },
          { label: 'F17', value: 'F17', size: 'fkey' },
          { label: 'F18', value: 'F18', size: 'fkey' },
          { label: 'F19', value: 'F19', size: 'fkey' },
          { label: 'F20', value: 'F20', size: 'fkey' },
          { label: 'F21', value: 'F21', size: 'fkey' },
          { label: 'F22', value: 'F22', size: 'fkey' },
          { label: 'F23', value: 'F23', size: 'fkey' },
          { label: 'F24', value: 'F24', size: 'fkey' },
        ],
        [
          { label: '`', value: '`' },
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' },
          { label: '7', value: '7' },
          { label: '8', value: '8' },
          { label: '9', value: '9' },
          { label: '0', value: '0' },
          { label: '-', value: '-' },
          { label: '=', value: '=' },
          { label: this.keyLabel('backspace', 'Backspace'), value: 'BACKSPACE', size: 'backspace' },
        ],
        [
          { label: this.keyLabel('tab', 'Tab'), value: 'TAB', size: 'tab' },
          { label: 'Q', value: 'Q' },
          { label: 'W', value: 'W' },
          { label: 'E', value: 'E' },
          { label: 'R', value: 'R' },
          { label: 'T', value: 'T' },
          { label: 'Y', value: 'Y' },
          { label: 'U', value: 'U' },
          { label: 'I', value: 'I' },
          { label: 'O', value: 'O' },
          { label: 'P', value: 'P' },
          { label: '[', value: '[' },
          { label: ']', value: ']' },
          { label: '\\', value: '\\', size: 'slash' },
        ],
        [
          { label: this.keyLabel('capsLock', 'Caps'), value: 'CAPSLOCK', size: 'caps' },
          { label: 'A', value: 'A' },
          { label: 'S', value: 'S' },
          { label: 'D', value: 'D' },
          { label: 'F', value: 'F' },
          { label: 'G', value: 'G' },
          { label: 'H', value: 'H' },
          { label: 'J', value: 'J' },
          { label: 'K', value: 'K' },
          { label: 'L', value: 'L' },
          { label: ';', value: ';' },
          { label: "'", value: "'" },
          { label: this.keyLabel('enter', 'Enter'), value: 'ENTER', size: 'enter' },
        ],
        [
          { label: this.keyLabel('shiftLeft', 'Shift L'), value: 'shift_left', size: 'shift-left' },
          { label: 'Z', value: 'Z' },
          { label: 'X', value: 'X' },
          { label: 'C', value: 'C' },
          { label: 'V', value: 'V' },
          { label: 'B', value: 'B' },
          { label: 'N', value: 'N' },
          { label: 'M', value: 'M' },
          { label: ',', value: ',' },
          { label: '.', value: '.' },
          { label: '/', value: '/' },
          { label: this.keyLabel('shiftRight', 'Shift R'), value: 'shift_right', size: 'shift-right' },
        ],
        [
          { label: this.keyLabel('ctrlLeft', 'Ctrl L'), value: 'ctrl_left', size: 'mod' },
          { label: this.keyLabel('metaLeft', 'Win L'), value: 'meta_left', size: 'mod' },
          { label: this.keyLabel('altLeft', 'Alt L'), value: 'alt_left', size: 'mod' },
          { label: this.keyLabel('space', 'Space'), value: 'SPACE', size: 'space' },
          { label: this.keyLabel('altRight', 'Alt R'), value: 'alt_right', size: 'mod' },
          { label: this.keyLabel('metaRight', 'Win R'), value: 'meta_right', size: 'mod' },
          { label: this.keyLabel('menu', 'Menu'), value: 'MENU', size: 'mod' },
          { label: this.keyLabel('ctrlRight', 'Ctrl R'), value: 'ctrl_right', size: 'mod' },
        ],
      ]
    },

    systemKeys(): any[] {
      return [
        { label: this.keyLabel('printScreen', 'Print'), value: 'PRINTSCREEN' },
        { label: this.keyLabel('scrollLock', 'ScrLk'), value: 'SCROLLLOCK' },
        { label: this.keyLabel('pause', 'Pause'), value: 'PAUSE' },
        { label: this.keyLabel('insert', 'Ins'), value: 'INSERT' },
        { label: this.keyLabel('delete', 'Del'), value: 'DELETE' },
        { label: this.keyLabel('home', 'Home'), value: 'HOME' },
        { label: this.keyLabel('end', 'End'), value: 'END' },
        { label: this.keyLabel('pageUp', 'PgUp'), value: 'PAGEUP' },
        { label: this.keyLabel('pageDown', 'PgDn'), value: 'PAGEDOWN' },
      ]
    },

    numpadKeys(): any[] {
      return [
        { label: this.keyLabel('numLock', 'Num'), value: 'NUMLOCK' },
        { label: '/', value: 'NUMPAD_DIVIDE' },
        { label: '*', value: 'NUMPAD_MULTIPLY' },
        { label: '-', value: 'NUMPAD_SUBTRACT' },
        { label: '7', value: 'NUMPAD_7' },
        { label: '8', value: 'NUMPAD_8' },
        { label: '9', value: 'NUMPAD_9' },
        { label: '+', value: 'NUMPAD_ADD', size: 'tall' },
        { label: '4', value: 'NUMPAD_4' },
        { label: '5', value: 'NUMPAD_5' },
        { label: '6', value: 'NUMPAD_6' },
        { label: '1', value: 'NUMPAD_1' },
        { label: '2', value: 'NUMPAD_2' },
        { label: '3', value: 'NUMPAD_3' },
        { label: this.keyLabel('enter', 'Enter'), value: 'NUMPAD_ENTER', size: 'tall' },
        { label: '0', value: 'NUMPAD_0', size: 'wide' },
        { label: '.', value: 'NUMPAD_DECIMAL' },
      ]
    },
  },

  created() {
    this.task
    const initial = this.getBestDurationUnit(this.getDurationSeconds())
    this.durationValue = initial.value
    this.durationUnit = initial.unit
  },

  beforeUnmount() {
    this.stopKeyRecording(false)
  },

  methods: {
    keyLabel(key: string, fallback: string): string {
      const translated = String(this.$t(`macro.core.keyboard.keys.${key}`))
      return translated === `macro.core.keyboard.keys.${key}` ? fallback : translated
    },

    getDurationSeconds(): number {
      const value = Number(this.keyboardData.duration)
      return Number.isFinite(value) && value >= 0 ? value : 0
    },

    saveDuration(): void {
      const value = Number(this.durationValue)
      const safeValue = Number.isFinite(value) && value >= 0 ? value : 0
      this.keyboardData.duration = safeValue * UNIT_TO_SECONDS[this.durationUnit]
    },

    getBestDurationUnit(seconds: number): { value: number; unit: TimeUnit } {
      if (seconds > 0 && seconds % 3600 === 0) return { value: seconds / 3600, unit: 'hours' }
      if (seconds > 0 && seconds % 60 === 0) return { value: seconds / 60, unit: 'minutes' }
      if (seconds > 0 && seconds < 1) return { value: seconds * 1000, unit: 'milliseconds' }
      return { value: seconds, unit: 'seconds' }
    },

    formatDurationSeconds(seconds: number): string {
      if (!(seconds > 0)) return ''
      if (seconds < 1) return String(this.$t('macro.common.duration.milliseconds', { count: this.formatNumber(seconds * 1000) }))
      if (seconds < 60) return String(this.$t('macro.common.duration.seconds', { count: this.formatNumber(seconds) }))
      if (seconds < 3600) return String(this.$t('macro.common.duration.minutes', { count: this.formatNumber(seconds / 60) }))
      return String(this.$t('macro.common.duration.hours', { count: this.formatNumber(seconds / 3600) }))
    },

    formatNumber(value: number): string {
      return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
    },

    formatKeyPress(value: any): string {
      if (!Array.isArray(value)) return ''
      return value.join(' + ')
    },

    isKeySelected(key: string): boolean {
      return this.selectedKeys.includes(key)
    },

    setSelectedKeys(keys: string[]) {
      this.keyboardData.keys.splice(0, this.keyboardData.keys.length, ...keys)
    },

    toggleKey(key: string) {
      const keys = [...this.selectedKeys]
      const keyIndex = keys.indexOf(key)

      if (keyIndex >= 0) {
        keys.splice(keyIndex, 1)
      } else {
        keys.push(key)
      }

      this.setSelectedKeys(keys)
    },

    clearKeys() {
      this.setSelectedKeys([])
    },

    toggleKeyRecording() {
      if (this.recordingKeys) {
        this.stopKeyRecording(true)
        return
      }

      this.startKeyRecording()
    },

    startKeyRecording() {
      this.recordingKeys = true
      this.pressedKeys = new Set<string>()

      const onKeyDown = (event: KeyboardEvent) => {
        event.preventDefault()
        event.stopPropagation()

        this.pressedKeys.add(this.normalizeRecordedKey(event))
      }

      const onKeyUp = (event: KeyboardEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }

      window.addEventListener('keydown', onKeyDown, true)
      window.addEventListener('keyup', onKeyUp, true)

      this.keyRecorderCleanup = () => {
        window.removeEventListener('keydown', onKeyDown, true)
        window.removeEventListener('keyup', onKeyUp, true)
      }
    },

    stopKeyRecording(save: boolean) {
      this.keyRecorderCleanup?.()
      this.keyRecorderCleanup = null

      const keys = [...this.pressedKeys].filter(Boolean)

      this.recordingKeys = false
      this.pressedKeys = new Set<string>()

      if (save) {
        this.setSelectedKeys(keys)
      }
    },

    normalizeRecordedKey(event: KeyboardEvent): string {
      const codeMap: Record<string, string> = {
        ControlLeft: 'ctrl_left',
        ControlRight: 'ctrl_right',
        AltLeft: 'alt_left',
        AltRight: 'alt_right',
        ShiftLeft: 'shift_left',
        ShiftRight: 'shift_right',
        MetaLeft: 'meta_left',
        MetaRight: 'meta_right',
        NumpadEnter: 'NUMPAD_ENTER',
        NumpadDivide: 'NUMPAD_DIVIDE',
        NumpadMultiply: 'NUMPAD_MULTIPLY',
        NumpadSubtract: 'NUMPAD_SUBTRACT',
        NumpadAdd: 'NUMPAD_ADD',
        NumpadDecimal: 'NUMPAD_DECIMAL',
        Numpad0: 'NUMPAD_0',
        Numpad1: 'NUMPAD_1',
        Numpad2: 'NUMPAD_2',
        Numpad3: 'NUMPAD_3',
        Numpad4: 'NUMPAD_4',
        Numpad5: 'NUMPAD_5',
        Numpad6: 'NUMPAD_6',
        Numpad7: 'NUMPAD_7',
        Numpad8: 'NUMPAD_8',
        Numpad9: 'NUMPAD_9',
      }

      if (codeMap[event.code]) {
        return codeMap[event.code]
      }

      const keyMap: Record<string, string> = {
        Escape: 'ESC',
        ' ': 'SPACE',
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        Backspace: 'BACKSPACE',
        Delete: 'DELETE',
        Insert: 'INSERT',
        Home: 'HOME',
        End: 'END',
        PageUp: 'PAGEUP',
        PageDown: 'PAGEDOWN',
        PrintScreen: 'PRINTSCREEN',
        ScrollLock: 'SCROLLLOCK',
        Pause: 'PAUSE',
        Enter: 'ENTER',
        Tab: 'TAB',
        CapsLock: 'CAPSLOCK',
      }

      return keyMap[event.key] ?? event.key.toUpperCase()
    },
  },
}
</script>

<style scoped>
.keyboard-shell {
  max-width: 100%;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px;
  background:
    radial-gradient(circle at 20% 0%, rgba(var(--v-theme-primary), 0.08), transparent 34%),
    rgba(255, 255, 255, 0.025);
}

.keyboard-layout {
  --key: 44px;
  --gap: 6px;
  display: flex;
  align-items: flex-end;
  gap: 26px;
  width: max-content;
  margin: 0 auto;
}

.keyboard-main {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.keyboard-row {
  display: grid;
  grid-template-columns: repeat(15, var(--key));
  grid-auto-rows: var(--key);
  gap: var(--gap);
}

.keyboard-key {
  position: relative;
  min-width: 0;
  height: var(--key);
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom-color: rgba(0, 0, 0, 0.42);
  border-radius: 9px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.045));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 2px 0 rgba(0, 0, 0, 0.28);
  color: rgb(var(--v-theme-on-surface));
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;
}

.keyboard-key:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.07));
  border-color: rgba(255, 255, 255, 0.24);
}

.keyboard-key:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 1px 0 rgba(0, 0, 0, 0.24);
}

.keyboard-key--active {
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.78));
  border-color: rgba(var(--v-theme-primary), 0.95);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 0 0 2px rgba(var(--v-theme-primary), 0.20),
    0 2px 0 rgba(0, 0, 0, 0.25);
  color: rgb(var(--v-theme-on-primary));
}

.keyboard-key--backspace { grid-column: span 2; }
.keyboard-key--tab { grid-column: span 2; }
.keyboard-key--slash { grid-column: span 1; }
.keyboard-key--caps { grid-column: span 2; }
.keyboard-key--enter { grid-column: span 2; }
.keyboard-key--shift-left { grid-column: span 2; }
.keyboard-key--shift-right { grid-column: span 3; }
.keyboard-key--mod { grid-column: span 1; }
.keyboard-key--fkey { grid-column: span 1; }
.keyboard-key--space { grid-column: span 6; }

.keyboard-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 1px;
}

.keyboard-side-row {
  display: grid;
  grid-template-columns: repeat(3, 54px);
  grid-auto-rows: var(--key);
  gap: var(--gap);
}

.keyboard-key--side {
  width: 54px;
  min-width: 54px;
  padding: 0 6px;
}

.keyboard-arrow-grid {
  display: grid;
  grid-template-columns: repeat(3, 54px);
  grid-auto-rows: var(--key);
  gap: var(--gap);
}

.keyboard-numpad {
  display: grid;
  grid-template-columns: repeat(4, 54px);
  grid-auto-rows: var(--key);
  gap: var(--gap);
  padding-bottom: 1px;
}

.keyboard-key--numpad {
  width: 54px;
  min-width: 54px;
  padding: 0 6px;
}

.keyboard-key--numpad-tall {
  grid-row: span 2;
  height: calc((var(--key) * 2) + var(--gap));
}

.keyboard-key--numpad-wide {
  grid-column: span 2;
  width: 100%;
}

@media (max-width: 900px) {
  .keyboard-shell {
    padding: 12px;
  }

  .keyboard-layout {
    --key: 40px;
    gap: 18px;
  }

  .keyboard-key {
    border-radius: 8px;
    font-size: 11px;
    padding-inline: 6px;
  }

  .keyboard-side-row,
  .keyboard-arrow-grid {
    grid-template-columns: repeat(3, 50px);
  }

  .keyboard-numpad {
    grid-template-columns: repeat(4, 50px);
  }

  .keyboard-key--side,
  .keyboard-key--numpad {
    width: 50px;
    min-width: 50px;
  }

  .keyboard-key--numpad-wide {
    width: 100%;
  }
}
</style>

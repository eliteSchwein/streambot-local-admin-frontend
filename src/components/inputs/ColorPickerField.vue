<template>
  <div class="color-picker-field">
    <div class="color-picker-field__anchor">
      <v-text-field
        :model-value="String(modelValue ?? '')"
        :disabled="disabled"
        :label="label"
        :hint="hint"
        :persistent-hint="persistentHint"
        :density="density"
        :variant="variant"
        :hide-details="hideDetails"
        :prepend-inner-icon="prependInnerIcon"
        autocomplete="off"
        spellcheck="false"
        @focus="menuOpen = true"
        @update:model-value="$emit('update:modelValue', String($event ?? ''))"
      >
        <template #append-inner>
          <button
            type="button"
            class="color-picker-field__swatch"
            :disabled="disabled"
            :style="{ backgroundColor: pickerColor }"
            @mousedown.stop.prevent
            @click.stop="menuOpen = true"
          />
        </template>
      </v-text-field>

      <v-menu
        v-model="menuOpen"
        activator="parent"
        :open-on-click="false"
        :close-on-content-click="false"
        location="bottom"
        origin="top"
        offset="6"
      >
        <v-card color="grey-darken-3" class="color-picker-field__popup">
          <div class="color-picker-field__layout">
            <div class="color-picker-field__picker">
              <v-color-picker
                :model-value="pickerColor"
                hide-inputs
                mode="hex"
                @update:model-value="setPickerColor"
              />
            </div>

            <div class="color-picker-field__rgb">
              <div class="text-subtitle-2 mb-3">RGB</div>

              <div class="color-picker-field__rgb-row">
                <strong>R</strong>
                <v-slider
                  v-model="red"
                  min="0"
                  max="255"
                  step="1"
                  hide-details
                  thumb-label
                />
                <v-text-field
                  v-model.number="red"
                  type="number"
                  min="0"
                  max="255"
                  step="1"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div class="color-picker-field__rgb-row">
                <strong>G</strong>
                <v-slider
                  v-model="green"
                  min="0"
                  max="255"
                  step="1"
                  hide-details
                  thumb-label
                />
                <v-text-field
                  v-model.number="green"
                  type="number"
                  min="0"
                  max="255"
                  step="1"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </div>

              <div class="color-picker-field__rgb-row">
                <strong>B</strong>
                <v-slider
                  v-model="blue"
                  min="0"
                  max="255"
                  step="1"
                  hide-details
                  thumb-label
                />
                <v-text-field
                  v-model.number="blue"
                  type="number"
                  min="0"
                  max="255"
                  step="1"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </div>
            </div>
          </div>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
type Rgb = {
  r: number
  g: number
  b: number
}

function clamp(value: unknown): number {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, Math.min(255, Math.round(parsed)))
}

function parseHex(text: string): Rgb | null {
  let value = text.trim()

  if (value.startsWith('#')) {
    value = value.slice(1)
  }

  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  if (!/^[0-9a-f]{6}$/i.test(value)) {
    return null
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function parseRgbFunction(text: string): Rgb | null {
  const match = text
    .trim()
    .match(/^rgba?\(\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\.\d+))(?:\s*[,/]\s*[+-]?(?:\d+\.?\d*|\.\d+)%?)?\s*\)$/i)

  if (!match) {
    return null
  }

  return {
    r: clamp(match[1]),
    g: clamp(match[2]),
    b: clamp(match[3]),
  }
}

function parseColor(value: unknown): Rgb | null {
  const text = String(value ?? '').trim()

  if (!text) {
    return null
  }

  return parseHex(text) ?? parseRgbFunction(text)
}

function rgbToHex(rgb: Rgb): string {
  return `#${[
    clamp(rgb.r),
    clamp(rgb.g),
    clamp(rgb.b),
  ]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

export default {
  name: 'ColorPickerField',

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    persistentHint: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    omitHash: {
      type: Boolean,
      default: false,
    },
    density: {
      type: String,
      default: 'comfortable',
    },
    variant: {
      type: String,
      default: 'outlined',
    },
    hideDetails: {
      type: [Boolean, String],
      default: 'auto',
    },
    prependInnerIcon: {
      type: String,
      default: 'mdi-palette',
    },
    fallbackColor: {
      type: String,
      default: '#66BB6A',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      menuOpen: false,
    }
  },

  computed: {
    parsedColor(): Rgb {
      return parseColor(this.modelValue)
        ?? parseColor(this.fallbackColor)
        ?? { r: 102, g: 187, b: 106 }
    },

    pickerColor(): string {
      return rgbToHex(this.parsedColor)
    },

    rgb(): Rgb {
      return this.parsedColor
    },

    red: {
      get(): number {
        return this.rgb.r
      },
      set(value: number) {
        const hex = rgbToHex({
          ...this.rgb,
          r: clamp(value),
        })
        this.$emit('update:modelValue', this.omitHash ? hex.slice(1) : hex)
      },
    },

    green: {
      get(): number {
        return this.rgb.g
      },
      set(value: number) {
        const hex = rgbToHex({
          ...this.rgb,
          g: clamp(value),
        })
        this.$emit('update:modelValue', this.omitHash ? hex.slice(1) : hex)
      },
    },

    blue: {
      get(): number {
        return this.rgb.b
      },
      set(value: number) {
        const hex = rgbToHex({
          ...this.rgb,
          b: clamp(value),
        })
        this.$emit('update:modelValue', this.omitHash ? hex.slice(1) : hex)
      },
    },
  },

  methods: {
    emitRgb(rgb: Rgb) {
      const hex = rgbToHex(rgb)

      this.$emit(
        'update:modelValue',
        this.omitHash ? hex.slice(1) : hex,
      )
    },

    setPickerColor(value: unknown) {
      let raw = value

      if (value && typeof value === 'object') {
        const objectValue = value as any
        raw = objectValue.hex ?? objectValue.hexa ?? objectValue
      }

      const parsed = parseColor(raw)

      if (parsed) {
        this.emitRgb(parsed)
      }
    },

  },
}
</script>

<style scoped>
.color-picker-field__anchor {
  position: relative;
}

.color-picker-field__swatch {
  width: 26px;
  height: 26px;
  display: block;
  padding: 0;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, .35);
  cursor: pointer;
  flex: 0 0 auto;
}

.color-picker-field__swatch:disabled {
  cursor: default;
  opacity: .5;
}

.color-picker-field__popup {
  width: min(720px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  padding: 12px;
}

.color-picker-field__layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.color-picker-field__picker {
  width: 300px;
  min-width: 0;
}

.color-picker-field__picker :deep(.v-color-picker) {
  width: 100%;
  max-width: 100%;
}

.color-picker-field__rgb {
  min-width: 0;
  padding: 8px 4px;
}

.color-picker-field__rgb-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 78px;
  gap: 10px;
  align-items: center;
  min-height: 56px;
}

@media (max-width: 959.98px) {
  .color-picker-field__popup {
    width: min(420px, calc(100vw - 24px));
  }

  .color-picker-field__layout {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .color-picker-field__picker,
  .color-picker-field__rgb {
    width: 100%;
    min-width: 0;
  }
}
</style>

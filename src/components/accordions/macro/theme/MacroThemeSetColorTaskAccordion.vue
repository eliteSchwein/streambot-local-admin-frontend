<template>
  <MacroTaskAccordionTemplate
    class="macro-theme-set-color-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-palette"
    :title="$t('macro.theme.setColor.title')"
    export-prefix="macro_theme_set_color"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <ColorPickerField
      v-model="color"
      :label="$t('macro.theme.fields.color')"
      :hint="$t('macro.theme.setColor.hint')"
      persistent-hint
      omit-hash
      fallback-color="#FF9800"
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import ColorPickerField from '@/components/inputs/ColorPickerField.vue'

export default {
  name: 'MacroThemeSetColorTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
    ColorPickerField,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    color: {
      get(): string {
        return String((this.item as any).task?.data?.color ?? 'ff9800')
      },
      set(value: unknown) {
        ;(this.item as any).task.data ??= {}
        ;(this.item as any).task.data.color = String(value ?? '')
      },
    },
  },

  created() {
    ;(this.item as any).task.data ??= {}

    if (!(this.item as any).task.data.color) {
      ;(this.item as any).task.data.color = 'ff9800'
    }
  },
}
</script>

<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    :depth="depth"
    :title="$t('macro.colorConverter.title')"
    icon="mdi-swap-horizontal-bold"
    export-prefix="color_converter"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-2"
          :text="$t('macro.colorConverter.info')"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="data.from"
          :items="formats"
          item-title="title"
          item-value="value"
          :label="$t('macro.colorConverter.from')"
          density="compact"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="data.to"
          :items="formats"
          item-title="title"
          item-value="value"
          :label="$t('macro.colorConverter.to')"
          density="compact"
          variant="outlined"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model="data.value"
          :label="$t('macro.colorConverter.value')"
          :hint="valueHint"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model="data.key"
          :label="$t('macro.function.fields.variableKey')"
          :hint="$t('macro.colorConverter.variableHint')"
          persistent-hint
          density="compact"
          variant="outlined"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroColorConverterTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      return (this.item as any).task
    },

    data(): any {
      return this.task.data
    },

    formats(): Array<{ title: string, value: string }> {
      return [
        { title: 'HEX', value: 'hex' },
        { title: 'DEC', value: 'dec' },
        { title: 'RGB', value: 'rgb' },
        { title: 'HSV', value: 'hsv' },
      ]
    },

    valueHint(): string {
      const key = `macro.colorConverter.valueHints.${String(this.data.from || 'hex')}`
      return String(this.$t(key))
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'color_converter'
    task.method ??= 'convert'

    if (!task.data || typeof task.data !== 'object') task.data = {}

    task.data.from ??= 'hex'
    task.data.to ??= 'rgb'
    task.data.value ??= ''
    task.data.key ??= 'converted_color'
  },
}
</script>

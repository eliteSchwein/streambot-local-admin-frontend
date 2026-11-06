<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-task-accordion--overlay-variable"
    :item="item"
    :index="index"
    icon="mdi-variable"
    :title="$t('macro.core.overlayVariable.title')"
    :detail="String(task.data?.key ?? '').trim()"
    export-prefix="macro_overlay_variable"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" density="compact">
          {{ $t('macro.core.overlayVariable.hint') }}
        </v-alert>
      </v-col>

      <v-col cols="12">
        <v-combobox
          v-model="task.data.key"
          :items="keyOptions"
          :label="$t('macro.core.overlayVariable.key')"
          prepend-inner-icon="mdi-key-outline"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="task.data.value"
          :label="$t('macro.core.overlayVariable.value')"
          prepend-inner-icon="mdi-code-braces"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          auto-grow
          rows="2"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroOverlayVariableTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  data() {
    return {
      appStore: useAppStore(),
    }
  },

  computed: {
    task(): any {
      return (this.item as any).task
    },

    keyOptions(): string[] {
      const store = this.appStore as any
      const dynamicData = store?.getDynamicData ?? store?.dynamicData ?? {}
      const overlayKeys = Array.isArray(dynamicData?.variable_keys) ? dynamicData.variable_keys : []

      const variables = store?.getVariables ?? {}
      const storedKeys = variables?.values && typeof variables.values === 'object'
        ? Object.keys(variables.values)
        : []

      const current = String(this.task.data?.key ?? '').trim()

      return [...new Set([
        ...overlayKeys,
        ...storedKeys,
        ...(current ? [current] : []),
      ].map(String).filter(Boolean))].sort((a, b) => a.localeCompare(b))
    },
  },

  created() {
    this.task.channel = 'overlay_variable'
    this.task.method = 'show'

    if (!this.task.data || typeof this.task.data !== 'object') {
      this.task.data = {}
    }

    if (this.task.data.key === undefined) this.task.data.key = ''
    if (this.task.data.value === undefined) this.task.data.value = ''
  },
}
</script>

<template>
  <MacroFunctionBaseTaskAccordion
    :item="item"
    :index="index"
    :depth="depth"
    :title-prefix="$t('macro.presets.expert.dumpVariables')"
    icon="mdi-database-export-outline"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <template #default>
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          :text="$t('macro.function.dumpVariables.info')"
        />
      </v-col>

      <v-col cols="12">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-open-in-new"
          @click="openDump"
        >
          {{ $t('macro.function.dumpVariables.openDump') }}
        </v-btn>
      </v-col>
    </template>
  </MacroFunctionBaseTaskAccordion>
</template>

<script lang="ts">
import MacroFunctionBaseTaskAccordion from './MacroFunctionBaseTaskAccordion.vue'

export default {
  name: 'MacroFunctionDumpVariablesTaskAccordion',

  components: {
    MacroFunctionBaseTaskAccordion,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['remove', 'move-up', 'move-down'],

  methods: {
    openDump() {
      window.open('/dumped_variables.json', '_blank', 'noopener,noreferrer')
    },
  },

  created() {
    const task = (this.item as any).task
    task.channel = 'function'
    task.method = 'dump_variables'
    if (!task.data || typeof task.data !== 'object') task.data = {}
  },
}
</script>

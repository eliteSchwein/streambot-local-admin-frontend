<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-stop-circle-outline"
    :title="`${ $t('macro.final.timer.actions.stop') } — ${task.data.name || '-'}`"
    export-prefix="macro_timer_stop"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-combobox
          v-model="task.data.name"
          :items="timerNameOptions"
          :label="$t('macro.final.timer.timerName')"
          prepend-inner-icon="mdi-timer-outline"
          variant="outlined"
          hide-details="auto"
          auto-select-first
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroTimerStopTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],
  data() {
    return { appStore: useAppStore() }
  },
  computed: {
    timerNameOptions(): string[] {
      const dynamicData = this.appStore?.getDynamicData ?? this.appStore?.dynamicData ?? {}
      const names = Array.isArray(dynamicData?.timer_names) ? dynamicData.timer_names : []
      const current = String(this.task.data?.name ?? this.task.data?.timer_name ?? '').trim()

      return [...new Set([
        ...names.map((value: any) => String(value).trim()).filter(Boolean),
        ...(current ? [current] : []),
      ])].sort((a, b) => a.localeCompare(b))
    },
    task(): any {
      const task = (this.item as any).task
      task.channel = 'timer'
      task.method = 'stop'
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      
      return task
    },
    
  },
  created() { this.task },
  
}
</script>

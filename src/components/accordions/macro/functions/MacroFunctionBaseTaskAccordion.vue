<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-function-task-accordion"
    :item="item"
    :index="index"
    :icon="icon"
    :title="accordionTitle"
    :detail="accordionDetail"
    :detail-href="detailHref"
    :detail-target="detailTarget"
    export-prefix="macro_function"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-text-field
      v-model="task.method"
      class="d-none"
      :label="$t('macro.function.fields.function')"
      density="compact"
      variant="outlined"
      hide-details
    />

    <v-row density="comfortable">
      <slot :task="task" :data="data" />
    </v-row>

    <slot name="after" :task="task" :data="data" />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroFunctionBaseTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
    depth: { type: Number, default: 0 },
    titlePrefix: { type: String, default: '' },
    customTitle: { type: String, default: '' },
    titleDetail: { type: [String, Number], default: undefined },
    detailHref: { type: String, default: '' },
    detailTarget: { type: String, default: '_blank' },
    icon: { type: String, default: 'mdi-function' },
  },

  emits: ['remove', 'move-up', 'move-down'],

  computed: {
    task(): any {
      return (this.item as any).task
    },

    data(): any {
      if (!this.task.data || typeof this.task.data !== 'object') {
        this.task.data = {}
      }

      return this.task.data
    },

    accordionTitle(): string {
      const customTitle = typeof this.customTitle === 'string'
        ? this.customTitle.trim()
        : ''
      if (customTitle) return customTitle

      const prefix = typeof this.titlePrefix === 'string'
        ? this.titlePrefix.trim()
        : ''
      if (prefix) return prefix

      return String(this.$t('macro.function.defaultTitle'))
    },

    accordionDetail(): string | number | undefined {
      if (this.titleDetail !== undefined) return this.titleDetail

      const hasExplicitTitle = Boolean(
        (typeof this.customTitle === 'string' && this.customTitle.trim())
        || (typeof this.titlePrefix === 'string' && this.titlePrefix.trim()),
      )
      if (hasExplicitTitle) return undefined

      return typeof this.task?.method === 'string'
        ? this.task.method.trim()
        : ''
    },
  },

  created() {
    this.task.channel = 'function'
  },
}
</script>

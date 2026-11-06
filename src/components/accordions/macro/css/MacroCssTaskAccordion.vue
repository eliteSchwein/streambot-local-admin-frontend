<template>
  <MacroTaskAccordionTemplate
    class="macro-task-accordion macro-task-accordion--css"
    :item="item"
    :index="index"
    icon="mdi-language-css3"
    :title="$t('macro.core.css.title')"
    :detail="cssTitleDetail"
    export-prefix="macro_css"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12">
        <v-select
          v-model="task.method"
          :items="methodOptions"
          :label="$t('macro.core.css.method')"
          prepend-inner-icon="mdi-swap-horizontal"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="task.data.selector"
          :label="$t('macro.core.css.selector')"
          :hint="task.method === 'reset' ? $t('macro.core.css.resetHint') : ''"
          persistent-hint
          placeholder="#alert .title, .badge > span"
          prepend-inner-icon="mdi-select-search"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          class="font-monospace"
        />
      </v-col>

      <v-col v-if="task.method !== 'reset'" cols="12">
        <v-textarea
          v-model="task.data.css"
          :label="$t('macro.core.css.css')"
          :hint="$t('macro.core.css.cssHint')"
          persistent-hint
          placeholder="color: red;&#10;transform: scale(1.2);"
          prepend-inner-icon="mdi-code-braces"
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          auto-grow
          rows="3"
          class="font-monospace"
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

const cssMethods = ['set', 'append', 'reset']

export default {
  name: 'MacroCssTaskAccordion',

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

    methodOptions(): { title: string, value: string }[] {
      return cssMethods.map((value) => ({
        title: this.$t(`macro.core.css.methods.${value}`),
        value,
      }))
    },

    cssTitleDetail(): string {
      const method = this.$t(`macro.core.css.methods.${this.task.method}`)
      const selector = String(this.task.data?.selector ?? '').trim()

      return selector ? `${method}: ${selector}` : method
    },
  },

  created() {
    this.task.channel = 'css'

    if (!cssMethods.includes(this.task.method)) this.task.method = 'set'

    if (!this.task.data || typeof this.task.data !== 'object') {
      this.task.data = {}
    }

    delete this.task.data.target

    if (this.task.data.selector === undefined) this.task.data.selector = ''
    if (this.task.data.css === undefined) this.task.data.css = ''
  },
}
</script>

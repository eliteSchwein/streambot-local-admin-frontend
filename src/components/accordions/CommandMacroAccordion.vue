<template>
  <ChannelPointMacroAccordion
    ref="inner"
    :name="name"
    :initial-content="currentContent"
    :disable-macro-read="disableMacroRead"
    template-context="command"
    :template-name="sourceName || name"
    :template-macro="name"
    :template-extra-variables="commandTemplateVariables"
  />
</template>

<script lang="ts">
import ChannelPointMacroAccordion from '@/components/accordions/ChannelPointMacroAccordion.vue'

export default {
  name: 'CommandMacroAccordion',
  components: { ChannelPointMacroAccordion },
  props: {
    name: { type: String, default: '' },
    sourceName: { type: String, default: '' },
    initialContent: { type: String, default: '' },
    disableMacroRead: { type: Boolean, default: false },
    commandParams: { type: Array, default: () => [] },
  },
  data() { return { currentContent: this.initialContent, pendingContent: null as string | null } },
  computed: {
    commandTemplateVariables(): any[] {
      const entries: any[] = []
      const seen = new Set<string>()

      const add = (path: string, type: string) => {
        const normalized = String(path ?? '').trim()
        if (!normalized || seen.has(normalized)) return
        seen.add(normalized)
        entries.push({
          path: normalized,
          expression: `\${${normalized}}`,
          type,
          source: 'command_param',
        })
      }

      for (const param of this.commandParams as any[]) {
        const name = String(param?.name ?? '').trim()
        if (!name || /[\s{}$]/.test(name)) continue

        const type = String(param?.type ?? 'string') === 'number' ? 'number' : 'string'
        // Runtime command payload exposes configured parameters both below params
        // and directly at the root. Keep params.* first because it is the explicit
        // command-parameter namespace.
        add(`params.${name}`, type)
        add(name, type)
      }

      return entries
    },
  },
  watch: { initialContent(value: string) { this.currentContent = value || ''; this.applyPendingContent() } },
  mounted() { this.applyPendingContent() },
  methods: {
    async applyPendingContent() {
      await this.$nextTick()
      const inner = this.$refs.inner as any
      if (!inner?.setContent) return
      if (this.pendingContent !== null) { inner.setContent(this.pendingContent, this.name); this.pendingContent = null; return }
      if (this.currentContent && this.disableMacroRead) inner.setContent(this.currentContent, this.name)
    },
    setContent(content: string, name = this.name) {
      this.currentContent = content || ''
      const inner = this.$refs.inner as any
      if (!inner?.setContent) { this.pendingContent = this.currentContent; return }
      return inner.setContent(this.currentContent, name)
    },
    loadMacro(name = this.name) { return (this.$refs.inner as any)?.loadMacro?.(name) },
    getContent() { return (this.$refs.inner as any)?.getContent?.() ?? this.currentContent },
  },
}
</script>

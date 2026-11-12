<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    icon="mdi-tune-vertical"
    :title="$t('macro.audio.setLinkVolumeTitle')"
    :detail="audioTitleValue"
    export-prefix="macro_audio_set_link_volume"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-autocomplete
      v-model="task.data.interface"
      :items="audioInterfaces"
      :label="$t('macro.audio.interface')"
      :placeholder="$t('macro.audio.interfacePlaceholder')"
      variant="outlined"
      density="comfortable"
      clearable
      auto-select-first
      hide-no-data
    />

    <v-autocomplete
      v-model="task.data.output"
      :items="outputItems"
      item-title="title"
      item-value="value"
      :label="$t('macro.audio.output')"
      :placeholder="$t('macro.audio.outputPlaceholder')"
      :hint="$t('macro.audio.linkVolumeHint')"
      persistent-hint
      variant="outlined"
      density="comfortable"
      class="mb-2"
      clearable
      auto-select-first
      hide-no-data
    />

    <v-text-field
      v-model.number="task.data.volume"
      :label="$t('macro.audio.volume')"
      type="number"
      min="0"
      max="100"
      suffix="%"
      variant="outlined"
      density="comfortable"
    />
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import {useAppStore} from '@/stores/app'

export default {
  name: 'MacroAudioSetLinkVolumeTaskAccordion',
  components: {MacroTaskAccordionTemplate},
  props: {
    item: {type: Object, required: true},
    index: {type: Number, required: true},
  },
  emits: ['remove', 'move-up', 'move-down'],
  setup() {
    const appStore = useAppStore()
    return {appStore}
  },
  created() {
    const task = (this.item as any).task
    task.channel = 'audio'
    task.method = 'set_link_volume'
    task.data = task.data && typeof task.data === 'object' ? task.data : {}
    task.data.interface ??= ''
    task.data.output ??= ''
    task.data.volume ??= 50
  },
  computed: {
    task(): any {
      return (this.item as any).task
    },
    audioTitleValue(): string {
      const iface = String(this.task.data?.interface ?? '').trim()
      const output = String(this.task.data?.output ?? '').trim()
      if (!iface) return ''
      const target = output ? `${iface} → ${this.outputLabel(output)}` : iface
      const volume = Number(this.task.data?.volume)
      return Number.isFinite(volume) ? `${target} · ${volume}%` : target
    },
    audioInterfaces(): string[] {
      return Object.keys(this.appStore.audioData ?? {}).sort((a, b) => a.localeCompare(b))
    },
    outputList(): any[] {
      const outputs: any = this.appStore.getAudioOutputs
      return Array.isArray(outputs) ? outputs : Object.values(outputs ?? {})
    },
    // Linked outputs of the selected interface first, then all others.
    outputItems(): Array<{ title: string, value: string }> {
      const iface = String(this.task.data?.interface ?? '').trim()
      const linked: string[] = (this.appStore.audioData as any)?.[iface]?.linked_outputs ?? []
      const names = Array.from(new Set([
        ...linked.map(String),
        ...this.outputList.map((output: any) => String(output?.name ?? '')).filter(Boolean),
      ]))
      return names.map(name => ({ title: this.outputLabel(name), value: name }))
    },
  },
  methods: {
    outputLabel(name: string): string {
      const output = this.outputList.find((entry: any) => String(entry?.name ?? '') === name)
      return String(output?.description ?? output?.display_name ?? name)
    },
  },
}
</script>

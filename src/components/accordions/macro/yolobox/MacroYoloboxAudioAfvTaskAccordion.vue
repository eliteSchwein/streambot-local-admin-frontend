<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    :icon="task.data.AFV ? 'mdi-link-variant' : 'mdi-link-variant-off'"
    :title="task.data.AFV
      ? $t('macro.presets.yolobox.audioSource.enableAfv')
      : $t('macro.presets.yolobox.audioSource.disableAfv')"
    :detail="yoloboxSourceTitle"
    export-prefix="macro_yolobox_set_audio_afv"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="task.data.id"
          :items="audioSources"
          item-title="title"
          item-value="value"
          :label="$t('macro.yolobox.fields.audioSource')"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'

export default {
  name: 'MacroYoloboxAudioAfvTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],
  computed: {
    yoloboxSourceTitle(): string {
      const id = String(this.task?.data?.id ?? '').trim()
      if (!id) return ''
      const match = this.audioSources.find((entry: any) => String(entry?.value ?? '') === id)
      const title = String(match?.title ?? id)
      return title
    },
    ...mapState(useAppStore, ['getYoloboxData']),
    task(): any {
      return (this.item as any).task
    },
    audioSources(): Array<{ title: string; value: string }> {
      return (this.getYoloboxData?.MixerList ?? []).map((source: any) => ({
        title: source.name || source.id,
        value: String(source.id),
      }))
    },
  },
  created() {
    this.task.channel = 'yolobox'
    this.task.method = 'set_audio_afv'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}
    this.task.data.id ??= ''
    this.task.data.AFV ??= true
  },
}
</script>

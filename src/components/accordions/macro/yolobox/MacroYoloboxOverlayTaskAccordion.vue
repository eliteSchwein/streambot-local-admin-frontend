<template>
  <MacroTaskAccordionTemplate
    :item="item"
    :index="index"
    :icon="task.data.isSelected ? 'mdi-eye-outline' : (task.data.id === 'all' ? 'mdi-layers-off-outline' : 'mdi-eye-off-outline')"
    :title="task.data.isSelected
      ? $t('macro.presets.yolobox.overlays.enableOverlay')
      : (task.data.id === 'all'
        ? $t('macro.presets.yolobox.overlays.disableAllOverlays')
        : $t('macro.presets.yolobox.overlays.disableOverlay'))"
    :detail="yoloboxOverlayTitle"
    export-prefix="macro_yolobox_overlay"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="task.data.id"
          :items="overlays"
          item-title="title"
          item-value="value"
          :label="$t('macro.yolobox.fields.overlay')"
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
  name: 'MacroYoloboxOverlayTaskAccordion',
  components: { MacroTaskAccordionTemplate },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['remove', 'move-up', 'move-down'],
  computed: {
    yoloboxOverlayTitle(): string {
      const id = String(this.task?.data?.id ?? '').trim()
      if (!id) return ''
      const match = this.overlays.find((entry: any) => String(entry?.value ?? '') === id)
      return String(match?.title ?? id)
    },
    ...mapState(useAppStore, ['getYoloboxData']),
    task(): any {
      return (this.item as any).task
    },
    overlays(): Array<{ title: string; value: string }> {
      const items = (this.getYoloboxData?.MaterialList ?? []).map((overlay: any) => ({
        title: overlay.name || overlay.materialName || overlay.id,
        value: String(overlay.id),
      }))

      if (String(this.task?.data?.id ?? '') === 'all') {
        return [{ title: String(this.$t('macro.yolobox.overlay.allOverlays')), value: 'all' }, ...items]
      }
      return items
    },
  },
  created() {
    this.task.channel = 'yolobox'
    this.task.method = 'order_material_change'
    this.task.data = this.task.data && typeof this.task.data === 'object' ? this.task.data : {}
    this.task.data.id ??= ''
    this.task.data.isSelected ??= true
  },
}
</script>

<template>
  <MacroTaskAccordionTemplate
    class="macro-obs-task-accordion"
    :item="item"
    :index="index"
    icon="mdi-file-video"
    :title="$t('macro.obs.setMediaPath.title')"
    :detail="data.inputName ? `${data.inputName}${data.path ? ` · ${data.path}` : ''}` : ''"
    export-prefix="macro_obs_set_media_path"
    @remove="$emit('remove')"
    @move-up="$emit('move-up')"
    @move-down="$emit('move-down')"
  >
    <v-row density="comfortable">
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="data.inputName"
          :items="inputOptions"
          :label="$t('macro.obs.fields.inputSource')"
          prepend-inner-icon="mdi-import"
          variant="outlined"
          hide-details="auto"
          clearable
          auto-select-first
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="data.path"
          :label="$t('macro.obs.setMediaPath.path')"
          :hint="$t('macro.obs.setMediaPath.pathHint')"
          prepend-inner-icon="mdi-folder-play"
          variant="outlined"
          hide-details="auto"
        />
      </v-col>

      <v-col cols="12">
        <v-switch
          v-model="data.restart"
          :label="$t('macro.obs.setMediaPath.restart')"
          color="primary"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>
  </MacroTaskAccordionTemplate>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import MacroTaskAccordionTemplate from '../MacroTaskAccordionTemplate.vue'
import { getInputNames, getObsSceneDataForTask, getObsAudioDataForTask } from './obsTaskHelpers'

export default {
  name: 'MacroObsSetMediaPathTaskAccordion',

  components: {
    MacroTaskAccordionTemplate,
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
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

    data(): any {
      return this.task.data
    },

    inputOptions(): string[] {
      return getInputNames(getObsSceneDataForTask(this.appStore, this.item), getObsAudioDataForTask(this.appStore, this.item))
    },
  },

  created() {
    this.task.channel = 'obs'
    this.task.method = 'set_media_path'
    this.task.data = this.task.data && typeof this.task.data === 'object'
      ? this.task.data
      : {}

    if (this.data.inputName === undefined) this.data.inputName = ''
    if (this.data.path === undefined) this.data.path = ''
    if (this.data.restart === undefined) this.data.restart = true
  },
}
</script>

<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-console-line" />
        {{ $t('dashboard.customize.cards.commands') }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text class="pt-3">
      <v-alert v-if="selectedCommandList.length === 0" density="compact" type="info" color="grey-darken-3" :text="$t('dashboard.commands.noneSelected')" />
      <div v-else class="command-list">
        <div v-for="item in selectedCommandList" :key="item.name" class="command-row">
          <div class="min-width-0">
            <div class="text-body-2 font-weight-medium text-truncate">!{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ commandRuntimeEnabled(item) ? $t('common.enabled') : $t('common.disabled') }}</div>
          </div>
          <v-switch :model-value="commandRuntimeEnabled(item)" density="compact" hide-details color="primary" :loading="Boolean(togglePending[item.name])" @update:model-value="toggleCommand(item, $event === true)" />
        </div>
      </div>
    </v-card-text>

    <v-dialog v-model="pickerDialog" max-width="620">
      <v-card>
        <v-toolbar flat density="compact">
          <v-toolbar-title class="d-flex align-center ga-2"><v-icon icon="mdi-tune-variant" />{{ $t('dashboard.commands.select') }}</v-toolbar-title>
          <v-btn icon="mdi-close" variant="text" @click="pickerDialog=false" />
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="pickerSearch" :label="$t('dashboard.commands.search')" prepend-inner-icon="mdi-magnify" clearable variant="outlined" density="compact" hide-details class="mb-3" />
          <v-list density="compact" class="picker-list">
            <v-list-item v-for="item in pickerCommandList" :key="item.name" :title="`!${item.name}`" @click="togglePicker(item.name)">
              <template #prepend><v-checkbox-btn :model-value="pickerSelection.includes(item.name)" @click.stop="togglePicker(item.name)" /></template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer/><v-btn variant="text" @click="pickerDialog=false">{{ $t('common.cancel') }}</v-btn><v-btn color="primary" variant="tonal" prepend-icon="mdi-content-save" @click="savePicker">{{ $t('common.save') }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

type CommandEntry={name:string;command:any}
export default {
  name:'DashboardCommandsCard',
  props:{ selectedCommands:{type:Array as ()=>string[],default:()=>[]} },
  emits:['update:selectedCommands'],
  data(){return{pickerDialog:false,pickerSearch:'',pickerSelection:[] as string[],togglePending:{} as Record<string,boolean>}},
  computed:{
    ...mapState(useAppStore,['getCommands']),
    commandList():CommandEntry[]{return Object.entries(this.getCommands??{}).map(([name,command])=>({name,command})).sort((a,b)=>a.name.localeCompare(b.name))},
    selectedCommandList():CommandEntry[]{const s=new Set((this.selectedCommands??[]).map(String));return this.commandList.filter(x=>s.has(x.name))},
    pickerCommandList():CommandEntry[]{const q=String(this.pickerSearch??'').trim().toLowerCase();return q?this.commandList.filter(x=>x.name.toLowerCase().includes(q)):this.commandList},
  },
  methods:{
    openPicker(){const available=new Set(this.commandList.map(x=>x.name));this.pickerSelection=(this.selectedCommands??[]).map(String).filter(x=>available.has(x));this.pickerSearch='';this.pickerDialog=true},
    togglePicker(name:string){const i=this.pickerSelection.indexOf(name);if(i>=0)this.pickerSelection.splice(i,1);else this.pickerSelection.push(name)},
    savePicker(){const available=new Set(this.commandList.map(x=>x.name));this.$emit('update:selectedCommands',Array.from(new Set(this.pickerSelection)).filter(x=>available.has(x)).sort((a,b)=>a.localeCompare(b)));this.pickerDialog=false},
    commandRuntimeEnabled(item:CommandEntry){return typeof item.command?.runtime_enabled==='boolean'?item.command.runtime_enabled:item.command?.enabled!==false},
    async toggleCommand(item:CommandEntry,enabled:boolean){if(this.togglePending[item.name])return;this.togglePending[item.name]=true;try{await getWebsocketClient()?.request('commands_toggle',{name:item.name,enabled},15000)}finally{delete this.togglePending[item.name]}},
  },
}
</script>
<style scoped>
.command-list,.picker-list{max-height:360px;overflow-y:auto}.command-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px;padding:6px 8px 6px 10px;border-bottom:thin solid rgba(var(--v-border-color),var(--v-border-opacity))}.command-row:last-child{border-bottom:0}.min-width-0{min-width:0}
</style>

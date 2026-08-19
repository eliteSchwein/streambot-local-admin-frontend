import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyAudioPresetsUpdateMessage extends BaseMessage {
  method = 'notify_audio_presets_update'

  async handle(data: any) {
    this.store.setAudioPresets(data?.presets ?? {})
  }
}

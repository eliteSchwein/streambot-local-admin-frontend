import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyTwitchDataMessage extends BaseMessage {
  method = 'notify_twitch_data'
  async handle(data: any) { this.store.setTwitchData(data) }
}

import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyUpdateManagerMessage extends BaseMessage {
  method = 'notify_update_manager'

  async handle(data: any) {
    this.store.setUpdateManager(data)
  }
}

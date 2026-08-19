import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyDynamicDataUpdateMessage extends BaseMessage {
  method = 'notify_dynamic_data_update'

  async handle(data: any) {
    this.store.setDynamicData(data?.dynamic_data ?? data ?? {})
  }
}

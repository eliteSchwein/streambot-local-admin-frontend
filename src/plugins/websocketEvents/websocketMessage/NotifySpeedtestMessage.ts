import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifySpeedtestMessage extends BaseMessage {
  method = 'notify_speedtest_update'

  async handle(data: any) {
    this.store.setSpeedtest(data)
  }
}

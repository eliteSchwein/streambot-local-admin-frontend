import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyEventsUpdateMessage extends BaseMessage {
  method = 'notify_events_update'

  async handle(data: any) {
    this.store.setEvents(data?.events ?? {})
  }
}

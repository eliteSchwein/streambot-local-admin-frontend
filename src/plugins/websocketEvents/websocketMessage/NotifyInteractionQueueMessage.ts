import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyInteractionQueueMessage extends BaseMessage {
  method = 'notify_interaction_queue'

  async handle(data: any) {
    this.store.setInteractions(Array.isArray(data) ? data : [])
  }
}

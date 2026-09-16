import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyRestoreMessage extends BaseMessage {
  method = 'notify_restore'

  async handle(data: any) {
    this.store.setRestoreNotification(data)
  }
}

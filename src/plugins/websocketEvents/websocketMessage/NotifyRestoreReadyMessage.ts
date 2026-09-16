import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyRestoreReadyMessage extends BaseMessage {
  method = 'notify_restore_ready'

  async handle(data: any) {
    this.store.setRestoreNotification(data)
  }
}

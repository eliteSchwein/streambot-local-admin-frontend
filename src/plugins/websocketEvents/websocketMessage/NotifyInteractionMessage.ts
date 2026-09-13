import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyInteractionMessage extends BaseMessage {
  method = 'notify_interaction'

  async handle(data: any) {
    const action = String(data?.action ?? '')
    const interaction = data?.interaction
    if (!interaction?.uuid) return

    if (action === 'finish' || action === 'cancel' || action === 'failed') {
      this.store.removeInteraction(interaction.uuid)
      return
    }

    this.store.upsertInteraction(interaction)
  }
}

import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyObsAudioUpdateNamedMessage extends BaseMessage {
  method = 'notify_obs_audio_update_named'

  async handle(data: any) {
    if (!data) return

    const connection =
      data.connection
      ?? data.connectionName
      ?? data.connection_name
      ?? data.obs_id
      ?? data.obsId
      ?? data.obs
      ?? data.name
      ?? 'default'

    const audioData =
      data.data
      ?? data.audio
      ?? data.audioData
      ?? data.audio_data
      ?? data.inputs
      ?? {}

    this.store.setObsAudioDataForConnection(connection, audioData)
  }
}

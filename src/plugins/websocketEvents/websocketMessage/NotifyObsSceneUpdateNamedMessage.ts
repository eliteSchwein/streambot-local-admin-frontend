import BaseMessage from '@/plugins/websocketEvents/websocketMessage/BaseMessage'

export default class NotifyObsSceneUpdateNamedMessage extends BaseMessage {
  method = 'notify_obs_scene_update_named'

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

    const sceneData =
      data.data
      ?? data.scenes
      ?? data.sceneData
      ?? data.scene_data
      ?? []

    this.store.setObsSceneDataForConnection(connection, sceneData)
  }
}

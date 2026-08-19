import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyRotatingSceneUpdateMessage extends BaseMessage {
  method = 'notify_rotating_scene_update'

  async handle(data: any) {
    this.store.setRotatingScenes(data?.rotatingScenes ?? data ?? {})
  }
}

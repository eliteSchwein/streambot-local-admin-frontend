import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyWebcamUpdateMessage extends BaseMessage {
  method = 'notify_webcam_update'

  async handle(data: any) {
    this.store.setWebcam(data ?? null)
  }
}

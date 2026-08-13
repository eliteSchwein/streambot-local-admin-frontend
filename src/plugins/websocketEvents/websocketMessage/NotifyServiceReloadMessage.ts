import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyServiceReloadMessage extends BaseMessage {
  method = 'notify_service_reload'

  async handle(data: any) {
    if(data.type !== 'admin') return

    console.log(
      "[cold-reload] received reload signal, reloading page"
    );

    window.location.reload(true);
  }
}

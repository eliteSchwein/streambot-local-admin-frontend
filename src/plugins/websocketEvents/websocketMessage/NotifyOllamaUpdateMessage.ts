import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyOllamaUpdateMessage extends BaseMessage {
  method = 'notify_ollama_update'

  async handle(data: any) {
    const integrations = this.store.integrations ?? {}

    this.store.setIntegrations({
      ...integrations,
      ollama: {
        ...(integrations.ollama ?? {}),
        ...(data ?? {}),
      },
    })
  }
}

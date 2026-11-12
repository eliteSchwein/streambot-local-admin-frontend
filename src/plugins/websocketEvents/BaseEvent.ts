import type {WebsocketClient} from "@/plugins/webSocketClient";
import type {Store} from "pinia";
import {type Websocket, WebsocketEvent} from "websocket-ts";
import {useAppStore} from "@/stores/app";

export default class BaseEvent {
  webSocketClient: WebsocketClient
  store: useAppStore

  name: string
  eventTypes: WebsocketEvent[]

  public constructor(webSocketClient: WebsocketClient) {
    this.webSocketClient = webSocketClient
    this.store = webSocketClient.getStore()
  }

  register() {
    const socket = this.webSocketClient?.getWebsocket()
    if (!socket) return

    for(const eventType of this.eventTypes) {
      socket.addEventListener(eventType, (websocket: Websocket, event: any) => {
        // Ignore late events (e.g. close after a reconnect) from sockets that
        // have already been replaced, otherwise they flip the state of the
        // current connection back to disconnected.
        if (this.webSocketClient.getWebsocket() !== socket) return
        void this.handle(websocket, event)
      })
    }
  }

  async handle(websocket: Websocket, event: any) {

  }
}

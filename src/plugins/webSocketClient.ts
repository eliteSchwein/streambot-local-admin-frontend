import {Websocket, WebsocketEvent} from "websocket-ts";
import {getRandomInt, sleep} from "@/helper/GeneralHelper";
import ConnectEvent from "@/plugins/websocketEvents/ConnectEvent";
import MessageEvent from "@/plugins/websocketEvents/MessageEvent";
import DisconnectEvent from "@/plugins/websocketEvents/DisconnectEvent";

export default class WebsocketClient {
  url = ''
  websocket: Websocket|undefined = undefined
  store: useAppStore
  pendingRequests: Record<number, { method: string, resolve: (value: any) => void, reject: (error: any) => void, timeout: number }> = {}
  messageListeners: Record<string, Set<(data: any) => void>> = {}
  notificationEndpoints: string[] = []

  public constructor(
    url: string,
    store: useAppStore
  ) {
    this.url = url
    this.store = store
  }

  public setUrl(url: string) {
    this.url = url;
  }

  public async disconnect() {
    if(this.websocket) {
      this.websocket.close()
      await sleep(100)
    }
  }

  public async connect() {
    await this.disconnect()

    console.log("Connecting to Websocket")
    this.store.setWebsocketConnecting(true)

    this.websocket = new Websocket(this.url)

    this.registerEvents()
    this.registerRequestHandler()
  }

  public getWebsocket() {
    return this.websocket;
  }

  public getStore() {
    return this.store;
  }

  private registerEvents() {
    const messageEvent = new MessageEvent(this)
    this.notificationEndpoints = messageEvent.getRegisteredMethods()

    void new ConnectEvent(this).register()
    void new DisconnectEvent(this).register()
    void messageEvent.register()
  }


  public registerNotificationEndpoints() {
    if (!this.notificationEndpoints.length) return
    this.send('register_endpoints', this.notificationEndpoints)
  }

  public rejectPendingRequests(reason = 'websocket disconnected') {
    const error = new Error(reason)

    for (const [id, pending] of Object.entries(this.pendingRequests)) {
      window.clearTimeout(pending.timeout)
      pending.reject(error)
      delete this.pendingRequests[Number(id)]
    }
  }

  public onMessage(method: string, listener: (data: any) => void) {
    const normalizedMethod = String(method || '').trim()
    if (!normalizedMethod) return

    if (!this.notificationEndpoints.includes(normalizedMethod) && normalizedMethod.startsWith('notify_')) {
      this.notificationEndpoints.push(normalizedMethod)
      if (this.store.isWebsocketConnected) {
        this.send('register_endpoints', [normalizedMethod])
      }
    }

    if (!this.messageListeners[normalizedMethod]) {
      this.messageListeners[normalizedMethod] = new Set()
    }

    this.messageListeners[normalizedMethod].add(listener)
  }

  public offMessage(method: string, listener: (data: any) => void) {
    const listeners = this.messageListeners[method]
    if (!listeners) return

    listeners.delete(listener)

    if (listeners.size === 0) {
      delete this.messageListeners[method]
    }
  }

  public emitMessage(method: string, data: any) {
    const listeners = this.messageListeners[method]
    if (!listeners) return

    for (const listener of listeners) {
      listener(data)
    }
  }

  public send(method: string, data: any = {}) {
    try {
      this.websocket?.send(JSON.stringify({jsonrpc: "2.0", method: method, params: data, id: getRandomInt(100_000)}))
    } catch (error) {
      console.error('request to a websocket client failed!')
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
  }

  public request(method: string, data: any = {}, timeoutMs = 10_000): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = getRandomInt(100_000)
      const timeout = window.setTimeout(() => {
        delete this.pendingRequests[id]
        reject(new Error(`${method} websocket request timed out`))
      }, timeoutMs)

      this.pendingRequests[id] = {method, resolve, reject, timeout}

      try {
        this.websocket?.send(JSON.stringify({jsonrpc: "2.0", method: method, params: data, id}))
      } catch (error) {
        window.clearTimeout(timeout)
        delete this.pendingRequests[id]
        reject(error)
      }
    })
  }

  private registerRequestHandler() {
    const socket = this.websocket as any
    if (!socket) return

    const handler = (...args: any[]) => {
      const event = args.length > 1 ? args[1] : args[0]
      this.handleRequestMessage(event)
    }

    if (typeof socket.addEventListener === 'function') {
      try {
        socket.addEventListener(WebsocketEvent.message, handler)
      } catch {
        socket.addEventListener('message', handler)
      }
    }
  }

  private handleRequestMessage(event: any) {
    const message = this.parseMessage(event)
    if (message?.id === undefined || message?.id === null) return

    const pending = this.pendingRequests[message.id]
    if (!pending) return

    // Backend API replies use result_<request method> and carry the same id.
    // notify_* packets also have random ids, so id equality alone is not enough
    // to identify an RPC response.
    const expectedMethod = `result_${pending.method}`
    if (message?.method !== expectedMethod && !message?.error) return

    window.clearTimeout(pending.timeout)
    delete this.pendingRequests[message.id]

    if (message.error) {
      pending.reject(message)
      return
    }

    pending.resolve(message)
  }

  private parseMessage(event: any): any {
    const raw = event?.data ?? event

    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }

    return raw
  }
}

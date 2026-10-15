import BaseEvent from "@/plugins/websocketEvents/BaseEvent";
import {type Websocket, WebsocketEvent} from "websocket-ts";
import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";
import NotifyAlertQueryMessage from "@/plugins/websocketEvents/websocketMessage/NotifyAlertQueryMessage";
import NotifyGameUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyGameUpdateMessage";
import NotifyShieldModeMessage from "@/plugins/websocketEvents/websocketMessage/NotifyShieldModeMessage";
import NotifyChannelPointUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyChannelPointUpdateMessage";
import NotifyAudioUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyAudioUpdateMessage";
import NotifySystemInfoMessage from "@/plugins/websocketEvents/websocketMessage/NotifySystemInfoMessage.ts";
import NotifySceneMessage from "@/plugins/websocketEvents/websocketMessage/NotifySceneMessage.ts";
import NotifyConnectionMessage from "@/plugins/websocketEvents/websocketMessage/NotifyConnectionMessage.ts";
import NotifyConfigUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyConfigUpdateMessage.ts";
import NotifyObsSceneUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyObsSceneUpdateMessage.ts";
import NotifyObsSceneUpdateNamedMessage from "@/plugins/websocketEvents/websocketMessage/NotifyObsSceneUpdateNamedMessage.ts";
import NotifyTestMode from "@/plugins/websocketEvents/websocketMessage/NotifyTestMode.ts";
import NotifyPowerButtonMessage from "@/plugins/websocketEvents/websocketMessage/NotifyPowerButtonMessage.ts";
import NotifyVoiceListUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyVoiceListUpdateMessage.ts";
import NotifyMacroUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyMacroUpdateMessage.ts";
import NotifyAutoMacrosUpdate from "@/plugins/websocketEvents/websocketMessage/NotifyAutoMacrosUpdate.ts";
import NotifyVariableUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyVariableUpdateMessage.ts";
import NotifyGiveawayUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyGiveawayUpdateMessage.ts";
import NotifyYoloboxUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyYoloboxUpdateMessage.ts";
import NotifyObsAudioUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyObsAudioUpdateMessage.ts";
import NotifyObsAudioUpdateNamedMessage from "@/plugins/websocketEvents/websocketMessage/NotifyObsAudioUpdateNamedMessage.ts";
import NotifyAssetsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyAssetsUpdateMessage.ts";
import NotifyDisconnectMessage from "@/plugins/websocketEvents/websocketMessage/NotifyDisconnectMessage.ts";
import NotifyMusicUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyMusicUpdateMessage.ts";
import NotifyAudioOutputUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyAudioOutputUpdateMessage.ts";
import NotifyStorageUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyStorageUpdateMessage.ts";
import NotifyIntegrationsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyIntegrationsUpdateMessage.ts";
import NotifySettingsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifySettingsUpdateMessage.ts";
import NotifyPlaylistUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyPlaylistUpdateMessage.ts";
import NotifyReloadUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyReloadUpdateMessage.ts";
import NotifyCommandsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyCommandsUpdateMessage.ts";
import NotifyUpdateManagerMessage from "@/plugins/websocketEvents/websocketMessage/NotifyUpdateManagerMessage.ts";
import NotifyServiceReloadMessage from "@/plugins/websocketEvents/websocketMessage/NotifyServiceReloadMessage.ts";
import NotifyOllamaUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyOllamaUpdateMessage.ts";
import NotifyRotatingSceneUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyRotatingSceneUpdateMessage.ts";
import NotifyEventsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyEventsUpdateMessage.ts";
import NotifyAudioPresetsUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyAudioPresetsUpdateMessage.ts";
import NotifyDynamicDataUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyDynamicDataUpdateMessage.ts";
import NotifySpeedtestMessage from "@/plugins/websocketEvents/websocketMessage/NotifySpeedtestMessage.ts";
import NotifyInteractionQueueMessage from "@/plugins/websocketEvents/websocketMessage/NotifyInteractionQueueMessage.ts";
import NotifyInteractionMessage from "@/plugins/websocketEvents/websocketMessage/NotifyInteractionMessage.ts";
import NotifyRestoreMessage from "@/plugins/websocketEvents/websocketMessage/NotifyRestoreMessage.ts";
import NotifyRestoreReadyMessage from "@/plugins/websocketEvents/websocketMessage/NotifyRestoreReadyMessage.ts";
import NotifyCategoryLibraryUpdateMessage from "@/plugins/websocketEvents/websocketMessage/NotifyCategoryLibraryUpdateMessage.ts";
import NotifyTwitchDataMessage from "@/plugins/websocketEvents/websocketMessage/NotifyTwitchDataMessage.ts";
import NotifyThrottledMessage from "@/plugins/websocketEvents/websocketMessage/NotifyThrottledMessage.ts";

const MESSAGE_TYPES = [
  NotifyDisconnectMessage,
  NotifyAlertQueryMessage,
  NotifyGameUpdateMessage,
  NotifyShieldModeMessage,
  NotifyChannelPointUpdateMessage,
  NotifyAudioUpdateMessage,
  NotifySystemInfoMessage,
  NotifySceneMessage,
  NotifyConnectionMessage,
  NotifyConfigUpdateMessage,
  NotifyObsSceneUpdateMessage,
  NotifyObsSceneUpdateNamedMessage,
  NotifyTestMode,
  NotifyPowerButtonMessage,
  NotifyVoiceListUpdateMessage,
  NotifyMacroUpdateMessage,
  NotifyAutoMacrosUpdate,
  NotifyVariableUpdateMessage,
  NotifyGiveawayUpdateMessage,
  NotifyYoloboxUpdateMessage,
  NotifyObsAudioUpdateMessage,
  NotifyObsAudioUpdateNamedMessage,
  NotifyAssetsUpdateMessage,
  NotifyMusicUpdateMessage,
  NotifyAudioOutputUpdateMessage,
  NotifyStorageUpdateMessage,
  NotifyIntegrationsUpdateMessage,
  NotifySettingsUpdateMessage,
  NotifyPlaylistUpdateMessage,
  NotifyReloadUpdateMessage,
  NotifyCommandsUpdateMessage,
  NotifyUpdateManagerMessage,
  NotifyServiceReloadMessage,
  NotifyOllamaUpdateMessage,
  NotifyRotatingSceneUpdateMessage,
  NotifyEventsUpdateMessage,
  NotifyAudioPresetsUpdateMessage,
  NotifyDynamicDataUpdateMessage,
  NotifySpeedtestMessage,
  NotifyInteractionQueueMessage,
  NotifyInteractionMessage,
  NotifyRestoreMessage,
  NotifyRestoreReadyMessage,
  NotifyCategoryLibraryUpdateMessage,
  NotifyTwitchDataMessage,
  NotifyThrottledMessage,
] as const

export default class MessageEvent extends BaseEvent {
  name = 'message'
  eventTypes = [WebsocketEvent.message]
  private handlers = new Map<string, BaseMessage>()

  constructor(webSocketClient: any) {
    super(webSocketClient)

    for (const MessageType of MESSAGE_TYPES) {
      const handler = new MessageType(webSocketClient) as BaseMessage
      if (handler.method) this.handlers.set(handler.method, handler)
    }
  }

  public getRegisteredMethods() {
    return Array.from(this.handlers.keys())
  }

  async handle(websocket: Websocket, event: any) {
    let data: any

    try {
      data = JSON.parse(event?.data ?? event)
    } catch {
      return
    }

    // JSON-RPC responses are handled by WebsocketClient's request handler. They
    // are not notifications and must not pass through every notify_* handler.
    if (!data?.method) return

    const method = String(data.method)
    if (method.startsWith('result_')) return

    if (data?.error || data?.params?.error) {
      console.warn(data)
      return
    }

    const handler = this.handlers.get(method)

    if (handler) {
      await handler.handleMessage(data)
    }

    // Keep the lightweight listener API working for feature-local subscribers,
    // including future notifications which do not need a global store handler.
    this.webSocketClient.emitMessage(method, data?.params)
  }
}

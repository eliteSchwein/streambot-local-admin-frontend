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


const STATEFUL_METHODS = new Set<string>([
  'notify_interaction_queue',
  'notify_assets_update',
  'notify_ads',
  'notify_toggle_element',
  'notify_source_update',
  'notify_system_info',
  'notify_audio_update',
  'notify_virtual_audio_cables',
  'notify_channel_point_update',
  'notify_shield_mode',
  'notify_game_update',
  'notify_timer',
  'notify_visible_element',
  'notify_connection',
  'notify_connection_update',
  'notify_config_update',
  'notify_obs_scene_update',
  'notify_obs_scene_update_named',
  'notify_obs_audio_update',
  'notify_obs_audio_update_named',
  'notify_test_mode',
  'notify_voice_list_update',
  'notify_macro_update',
  'notify_commands_update',
  'notify_auto_macros_update',
  'notify_rotating_scene_update',
  'notify_rotating_scene_runtime_update',
  'notify_variables_update',
  'notify_giveaway_update',
  'notify_yolobox_update',
  'notify_music_show',
  'notify_music_update',
  'notify_audio_outputs_update',
  'notify_audio_presets_update',
  'notify_storage_update',
  'notify_integrations_update',
  'notify_settings_update',
  'notify_playlist_update',
  'notify_reload_update',
  'notify_update_manager',
  'notify_ollama_update',
  'notify_events_update',
  'notify_dynamic_data_update',
  'notify_speedtest_update',
  'notify_category_library_update',
  'notify_category_active',
  'notify_category_style_update',
  'notify_twitch_data',
])

function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function cloneStateValue(value: any): any {
  if (Array.isArray(value)) return value.map(cloneStateValue)
  if (!isPlainObject(value)) return value

  const result: Record<string, any> = {}
  for (const [key, entry] of Object.entries(value)) {
    result[key] = cloneStateValue(entry)
  }
  return result
}

function mergeStateDelta(previous: any, delta: any): any {
  // Arrays are authoritative whenever the backend sends them. Trying to merge
  // array indexes would keep removed entries around.
  if (Array.isArray(delta)) return delta.map(cloneStateValue)

  // Primitive values and null are explicit replacements.
  if (!isPlainObject(delta)) return delta

  const base = isPlainObject(previous) ? previous : {}
  const result: Record<string, any> = { ...base }

  for (const [key, value] of Object.entries(delta)) {
    result[key] = mergeStateDelta(base[key], value)
  }

  return result
}

export default class MessageEvent extends BaseEvent {
  name = 'message'
  eventTypes = [WebsocketEvent.message]
  private handlers = new Map<string, BaseMessage>()
  private stateByMethod = new Map<string, any>()

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

    let params = data?.params

    if (STATEFUL_METHODS.has(method)) {
      if (this.stateByMethod.has(method)) {
        params = mergeStateDelta(this.stateByMethod.get(method), params)
      } else {
        // First payload after a new connection is the authoritative full snapshot.
        params = cloneStateValue(params)
      }

      this.stateByMethod.set(method, params)
    }

    const normalizedMessage = params === data?.params
      ? data
      : { ...data, params }

    const handler = this.handlers.get(method)

    if (handler) {
      await handler.handleMessage(normalizedMessage)
    }

    // Local subscribers receive the same reconstructed state as the global store
    // handlers. This keeps delta-awareness centralized in one place.
    this.webSocketClient.emitMessage(method, params)
  }
}

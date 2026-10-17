import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyTwitchUserListMessage extends BaseMessage {
  method = 'notify_twitch_user_list'

  async handle(data: any) {
    this.store.setTwitchUserList(data)
  }
}

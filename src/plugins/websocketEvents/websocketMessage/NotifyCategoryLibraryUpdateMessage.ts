import BaseMessage from "@/plugins/websocketEvents/websocketMessage/BaseMessage";

export default class NotifyCategoryLibraryUpdateMessage extends BaseMessage {
  method = 'notify_category_library_update'

  async handle(data: any) {
    this.store.setCategoryLibrary(data)
  }
}

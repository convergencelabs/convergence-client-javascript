import {IChatEvent} from "./IChatEvent";

export class ChatJoinedEvent implements IChatEvent {
  public static readonly NAME = "joined";
  public readonly name: string = ChatJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly chatId: string) {
    Object.freeze(this);
  }
}

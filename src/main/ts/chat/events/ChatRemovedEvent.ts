import {IChatEvent} from "./IChatEvent";

export class ChatRemovedEvent implements IChatEvent {
  public static readonly NAME = "removed";
  public readonly name: string = ChatRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly chatId: string) {
    Object.freeze(this);
  }
}
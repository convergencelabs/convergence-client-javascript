import {IChatEvent} from "./IChatEvent";

export class ChatLeftEvent implements IChatEvent {
  public static readonly NAME = "left";
  public readonly name: string = ChatLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly chatId: string) {
    Object.freeze(this);
  }
}
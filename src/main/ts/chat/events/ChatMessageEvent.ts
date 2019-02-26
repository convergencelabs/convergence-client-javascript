import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class ChatMessageEvent extends ChatEvent {
  public static readonly NAME = "message";
  public readonly name: string = ChatMessageEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly message: string) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

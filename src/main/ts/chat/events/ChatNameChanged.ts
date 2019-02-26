import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class ChatNameChanged extends ChatEvent {
  public static readonly NAME = "name_changed";
  public readonly name: string = ChatNameChanged.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly chatName: string) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

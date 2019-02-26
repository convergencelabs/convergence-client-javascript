import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class UserLeftEvent extends ChatEvent {
  public static readonly NAME = "user_left";
  public readonly name: string = UserLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

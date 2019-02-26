import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class UserJoinedEvent extends ChatEvent {
  public static readonly NAME = "user_joined";
  public readonly name: string = UserJoinedEvent.NAME;

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

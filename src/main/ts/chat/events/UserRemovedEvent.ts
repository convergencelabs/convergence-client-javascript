import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class UserRemovedEvent extends ChatEvent {
  public static readonly NAME = "user_removed";
  public readonly name: string = UserRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly removedUser: DomainUser) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

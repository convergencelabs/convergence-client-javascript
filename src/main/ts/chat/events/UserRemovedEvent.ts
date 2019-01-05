import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

export class UserRemovedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_removed";
  public readonly name: string = UserRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly removedUser: DomainUser) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}
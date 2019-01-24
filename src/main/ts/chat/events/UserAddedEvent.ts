import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

export class UserAddedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_added";
  public readonly name: string = UserAddedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly addedUser: DomainUser) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}
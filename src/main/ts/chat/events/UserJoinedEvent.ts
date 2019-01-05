import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

export class UserJoinedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_joined";
  public readonly name: string = UserJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

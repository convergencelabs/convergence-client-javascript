import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

export class UserLeftEvent extends ChatChannelEvent {
  public static readonly NAME = "user_left";
  public readonly name: string = UserLeftEvent.NAME;

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

import {ChatChannelEvent} from "./ChatChannelEvent";

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
              public readonly username: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

import {ChatChannelEvent} from "./ChatChannelEvent";

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
              public readonly username: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

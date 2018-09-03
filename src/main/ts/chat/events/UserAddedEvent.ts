import {ChatChannelEvent} from "./ChatChannelEvent";

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
              public readonly username: string,
              public readonly addedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}
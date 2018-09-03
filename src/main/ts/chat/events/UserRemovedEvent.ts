import {ChatChannelEvent} from "./ChatChannelEvent";

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
              public readonly username: string,
              public readonly removedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}
import {ChatChannelEvent} from "./ChatChannelEvent";

export class ChatChannelNameChanged extends ChatChannelEvent {
  public static readonly NAME = "name_changed";
  public readonly name: string = ChatChannelNameChanged.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly channelName: string,
              public readonly changedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

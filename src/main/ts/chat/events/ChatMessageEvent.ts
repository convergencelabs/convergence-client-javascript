import {ChatChannelEvent} from "./ChatChannelEvent";

export class ChatMessageEvent extends ChatChannelEvent {
  public static readonly NAME = "message";
  public readonly name: string = ChatMessageEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly message: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

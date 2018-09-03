import {ChatChannelEvent} from "./ChatChannelEvent";

export class ChatChannelTopicChanged extends ChatChannelEvent {
  public static readonly NAME = "topic_changed";
  public readonly name: string = ChatChannelTopicChanged.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly topic: string,
              public readonly changedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}
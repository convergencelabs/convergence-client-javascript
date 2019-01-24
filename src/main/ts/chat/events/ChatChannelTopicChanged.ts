import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

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
              user: DomainUser,
              public readonly topic: string
  ) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

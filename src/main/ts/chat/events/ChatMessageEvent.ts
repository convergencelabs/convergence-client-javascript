import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

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
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly message: string) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

import {ChatChannelEvent} from "./ChatChannelEvent";
import {DomainUser} from "../../identity";

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
              user: DomainUser,
              public readonly channelName: string) {
    super(channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

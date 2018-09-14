import {IChatEvent} from "./IChatEvent";

export class ChannelJoinedEvent implements IChatEvent {
  public static readonly NAME = "joined";
  public readonly name: string = ChannelJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}

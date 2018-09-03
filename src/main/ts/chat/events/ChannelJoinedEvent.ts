import {ChatEvent} from "./ChatEvent";

export class ChannelJoinedEvent implements ChatEvent {
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

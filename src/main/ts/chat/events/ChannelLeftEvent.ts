import {IChatEvent} from "./IChatEvent";

export class ChannelLeftEvent implements IChatEvent {
  public static readonly NAME = "left";
  public readonly name: string = ChannelLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}
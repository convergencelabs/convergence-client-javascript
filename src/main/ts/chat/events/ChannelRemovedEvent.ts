import {IChatEvent} from "./IChatEvent";

export class ChannelRemovedEvent implements IChatEvent {
  public static readonly NAME = "removed";
  public readonly name: string = ChannelRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}
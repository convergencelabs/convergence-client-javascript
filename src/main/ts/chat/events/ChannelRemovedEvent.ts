import {ChatEvent} from "./ChatEvent";

export class ChannelRemovedEvent implements ChatEvent {
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
import {ChatEvent} from "./ChatEvent";

export class ChannelLeftEvent implements ChatEvent {
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
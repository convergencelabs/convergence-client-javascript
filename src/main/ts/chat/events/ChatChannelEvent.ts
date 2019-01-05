import {IChatEvent} from "./IChatEvent";
import {DomainUser} from "../../identity";

export abstract class ChatChannelEvent implements IChatEvent {
  public abstract readonly name: string;

  /**
   * @param channelId
   * @param eventNumber
   * @param timestamp
   *
   * @hidden
   * @internal
   */
  protected constructor(public readonly channelId: string,
                        public readonly eventNumber: number,
                        public readonly timestamp: Date,
                        public readonly user: DomainUser) {
  }
}

import {IChatEvent} from "./IChatEvent";
import {DomainUser} from "../../identity";

export abstract class ChatEvent implements IChatEvent {
  public abstract readonly name: string;

  /**
   * @param chatId
   * @param eventNumber
   * @param timestamp
   * @param user
   *
   * @hidden
   * @internal
   */
  protected constructor(public readonly chatId: string,
                        public readonly eventNumber: number,
                        public readonly timestamp: Date,
                        public readonly user: DomainUser) {
  }
}

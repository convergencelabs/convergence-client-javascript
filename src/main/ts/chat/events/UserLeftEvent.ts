import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[DomainUser]] leaves a [[Chat]].
 *
 * @module Chat
 */
export class UserLeftEvent extends ChatEvent {
  public static readonly NAME = "user_left";

  /**
   * @inheritdoc
   */
  public readonly name: string = UserLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string, eventNumber: number, timestamp: Date, user: DomainUser) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

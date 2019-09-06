import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[DomainUser]] leaves a [[Chat]].
 */
export class UserLeftEvent extends ChatEvent {
  public static readonly NAME = "user_left";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
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

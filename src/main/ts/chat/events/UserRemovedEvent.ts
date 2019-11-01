import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a particular [[DomainUser]] is removed from a [[Chat]].
 *
 * @module Chat
 */
export class UserRemovedEvent extends ChatEvent {
  public static readonly NAME = "user_removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = UserRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The user that was removed
     */
    public readonly removedUser: DomainUser
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

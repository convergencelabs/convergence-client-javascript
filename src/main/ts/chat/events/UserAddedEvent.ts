import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a new user is added to a particular [[Chat]].
 */
export class UserAddedEvent extends ChatEvent {
  public static readonly NAME = "user_added";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = UserAddedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
   /**
    * The ID of the [[Chat]] on which this event occurred
    */
    public readonly chatId: string,

    /**
     * This event's unique sequential number.  This can be useful when e.g. querying for
     * events on a particular chat ([[Chat.getHistory]]).
     */
    public readonly eventNumber: number,

    /**
     * The timestamp when the event occurred
     */
    public readonly timestamp: Date,

    /**
     * The user associated with the event
     */
    public readonly user: DomainUser,

    /**
     * The user that was added
     */
    public readonly addedUser: DomainUser
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

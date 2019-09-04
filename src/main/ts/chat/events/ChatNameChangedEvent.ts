import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[Chat]]'s name changes.
 */
export class ChatNameChangedEvent extends ChatEvent {
  public static readonly NAME = "name_changed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ChatNameChangedEvent.NAME;

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
     * The user associated wth the event
     */
    public readonly user: DomainUser,

    /**
     * The new name of the chat
     */
    public readonly chatName: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

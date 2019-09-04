import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when another user sends a message to a particular [[Chat]].
 */
export class ChatMessageEvent extends ChatEvent {
  public static readonly NAME = "message";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ChatMessageEvent.NAME;

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
     * The session associated with the event
     */
    public readonly sessionId: string,

    /**
     * The text of the message
     */
    public readonly message: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

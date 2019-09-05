import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when the current user joins a [[Chat]]. The primary reason for this event
 * is situations in which a user has multiple active sessions (e.g. using the app on
 * two different devices) and one of the sessions joins a [[ChatChannel]].  Since the
 * other session doesn't yet have access to the [[ChatChannel]], applications can
 * listen for this event to update their membership status.
 *
 * Note that this is emitted from the [[ChatService]] as opposed to a [[Chat]].
 */
export class ChatJoinedEvent implements IChatEvent {
  public static readonly NAME = "joined";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ChatJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The id of the chat that was just joined.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

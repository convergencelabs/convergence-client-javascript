import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when the current user joins a [[Chat]].
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

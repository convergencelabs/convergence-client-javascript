import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when a [[Chat]] is deleted.  See [[ChatService.delete]]
 */
export class ChatRemovedEvent implements IChatEvent {
  public static readonly NAME = "removed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ChatRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The ID of the chat that was deleted.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

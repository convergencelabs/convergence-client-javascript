import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when the current user leaves a [[Chat]].
 */
export class ChatLeftEvent implements IChatEvent {
  public static readonly NAME = "left";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ChatLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The ID of the chat that was just left.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

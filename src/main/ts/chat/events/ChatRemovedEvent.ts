import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when a [[Chat]] is deleted.  See [[ChatService.delete]]
 *
 * @module Chat
 */
export class ChatRemovedEvent implements IChatEvent {
  public static readonly NAME = "removed";

  /**
   * @inheritdoc
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

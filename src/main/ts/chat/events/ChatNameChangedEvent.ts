import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[Chat]]'s name changes.
 *
 * @module Chat
 */
export class ChatNameChangedEvent extends ChatEvent {
  public static readonly NAME = "name_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatNameChangedEvent.NAME;

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
     * The new name of the chat
     */
    public readonly chatName: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

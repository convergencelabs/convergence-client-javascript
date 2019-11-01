import { ChatHistoryEntry } from "./ChatHistoryEntry";
import { DomainUser } from "../../identity";
import { Immutable } from "../../util/Immutable";

/**
 * Represents a chat's name being changed.  Analogous to a [[ChatNameChangedEvent]].
 *
 * @module Chat
 */
export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.NAME_CHANGED;

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
     * The new name for the chat.
     */
    public readonly name: string
  ) {
    super(NameChangedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

import { ChatHistoryEntry } from "./ChatHistoryEntry";
import { DomainUser } from "../../identity";
import { Immutable } from "../../util/Immutable";

/**
 * Represents a user joining this chat.  Analogous to a [[UserJoinedEvent]].
 *
 * @module Chat
 */
export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.USER_JOINED;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserJoinedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

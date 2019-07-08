import {ChatInfo, Chat} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events/";
import {Observable} from "rxjs";
import {IdentityCache} from "../identity/IdentityCache";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {DomainUserIdentifier, DomainUserId} from "../identity";

/**
 * A [[MembershipChat]] chat is a chat construct that has a specific set of
 * users who belong to that chat. A [[MembershipChat]] keeps track of which
 * users are part of the chat.
 */
export abstract class MembershipChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
                        identityCache: IdentityCache,
                        messageStream: Observable<IChatEvent>,
                        info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): MembershipChatInfo {
    return super.info() as MembershipChatInfo;
  }

  /**
   * Leaves the chat, such that messages will no longer be received. The
   * semantics of this depend on the specific subclass.
   *
   * @returns
   *   A promise that will be resolved when the Chat is left successfully.
   */
  public leave(): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      leaveChatRequest: {
        chatId: this._info.chatId
      }
    }).then(() => {
      return;
    });
  }

  /**
   * Removes the specified user from the Chat.
   *
   * @param user
   *   The user to remove from the Chat.
   * @returns
   *   A promise that is resolved when the specified user is successfully
   *   removed from the chat.
   */
  public remove(user: DomainUserIdentifier): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      removeUserFromChatChannelRequest: {
        chatId: this._info.chatId,
        userToRemove: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => {
      return;
    });
  }
}

export type ChatMembership = "public" | "private";

export interface MembershipChatInfo extends ChatInfo {
  readonly membership: ChatMembership;
}

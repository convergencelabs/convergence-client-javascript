import {ChatInfo, Chat} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events/";
import {Observable} from "rxjs";
import {IdentityCache} from "../identity/IdentityCache";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {DomainUserId} from "../identity/DomainUserId";
import {DomainUserIdentifier} from "../identity";

export class MembershipChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): MembershipChatInfo {
    return super.info() as MembershipChatInfo;
  }

  public leave(): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      leaveChatRequest: {
        chatId: this._info.chatId
      }
    }).then(() => {
      return;
    });
  }

  public remove(user: DomainUserIdentifier): Promise<void> {
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

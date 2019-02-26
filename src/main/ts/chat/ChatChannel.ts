import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChat, MembershipChatInfo} from "./MembershipChat";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier} from "../identity";
import {DomainUserId} from "../identity/DomainUserId";
import {domainUserIdToProto} from "../connection/ProtocolUtil";

export class ChatChannel extends MembershipChat {

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

  public add(user: DomainUserIdentifier): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      addUserToChatChannelRequest: {
        chatId: this._info.chatId,
        userToAdd: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => {
      return;
    });
  }
}

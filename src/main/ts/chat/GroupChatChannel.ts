import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier} from "../identity";
import {DomainUserId} from "../identity/DomainUserId";
import {domainUserIdToProto} from "../connection/ProtocolUtil";

export class GroupChatChannel extends MembershipChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public add(user: DomainUserIdentifier): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      addUserToChatChannelRequest: {
        channelId: this._info.channelId,
        userToAdd: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => {
      return;
    });
  }
}

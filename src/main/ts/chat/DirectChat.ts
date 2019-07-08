import {ChatInfo, Chat, ChatMember} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";

/**
 * A [[DirectChat]] represents a Chat construct that is defined by a specific
 * set of users. The communication for a given DirectChat will always be
 * between the specified set of users.  This can not change for the life of
 * the DirectChat.
 */
export class DirectChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: ChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): DirectChatInfo {
    const info = super.info();
    const localUserId = this.session().user().userId;
    const otherUsers = info.members.filter(member => !member.user.userId.equals(localUserId));
    return {...info, otherUsers};
  }
}

export interface DirectChatInfo extends ChatInfo {
  readonly otherUsers: ChatMember[];
}

import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";

export class ChatRoomChannel extends MembershipChatChannel {

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
}

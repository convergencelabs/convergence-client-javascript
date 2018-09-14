import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {IChatEvent} from "./events/";

export class ChatRoomChannel extends MembershipChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }
}

import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {ChatEvent} from "./events/";

export class ChatRoomChannel extends MembershipChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }
}

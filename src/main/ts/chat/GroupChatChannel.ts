import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {ChatEvent} from "./events";
import {AddUserToChatChannelMessage} from "../connection/protocol/chat/joining";
import {MessageType} from "../connection/protocol/MessageType";

export class GroupChatChannel extends MembershipChatChannel {

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public add(username: string): Promise<void> {
    this._assertJoined();
    return this._connection.request(<AddUserToChatChannelMessage> {
      type: MessageType.ADD_USER_TO_CHAT_CHANNEL_REQUEST,
      channelId: this._info.channelId,
      username
    }).then(() => {
      return;
    });
  }
}

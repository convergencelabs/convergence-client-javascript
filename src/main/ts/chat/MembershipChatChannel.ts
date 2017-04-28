import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ChatEvent} from "./events";
import {Observable} from "rxjs";
import {AddUserToChatChannelMessage} from "../connection/protocol/chat/joining";
import {MessageType} from "../connection/protocol/MessageType";
import {RemoveUserFromChatChannelMessage, LeaveChatChannelRequestMessage} from "../connection/protocol/chat/leaving";

export class MembershipChatChannel extends ChatChannel {

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public info(): MembershipChatChannelInfo {
    return super.info() as MembershipChatChannelInfo;
  }

  public leave(): Promise<void> {
    this._assertJoined();
    return this._connection.request(<LeaveChatChannelRequestMessage> {
      type: MessageType.LEAVE_CHAT_CHANNEL_REQUEST,
      channelId: this._info.channelId
    }).then(() => {
      return;
    });
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

  public remove(username: string): Promise<void> {
    this._assertJoined();
    return this._connection.request(<RemoveUserFromChatChannelMessage> {
      type: MessageType.REMOVE_USER_FROM_CHAT_CHANNEL_REQUEST,
      channelId: this._info.channelId,
      username
    }).then(() => {
      return;
    });
  }
}

export type ChatChannelMembership = "public" | "private";

export declare interface MembershipChatChannelInfo extends ChatChannelInfo {
  readonly channelMembership: ChatChannelMembership;
}

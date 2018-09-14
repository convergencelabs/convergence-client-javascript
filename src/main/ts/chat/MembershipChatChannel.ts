import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events/";
import {Observable} from "rxjs";
import {MessageType} from "../connection/protocol/MessageType";
import {RemoveUserFromChatChannelMessage, LeaveChatChannelRequestMessage} from "../connection/protocol/chat/leaving";

export class MembershipChatChannel extends ChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public info(): MembershipChatChannelInfo {
    return super.info() as MembershipChatChannelInfo;
  }

  public leave(): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.LEAVE_CHAT_CHANNEL_REQUEST,
      channelId: this._info.channelId
    } as LeaveChatChannelRequestMessage).then(() => {
      return;
    });
  }

  public remove(username: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.REMOVE_USER_FROM_CHAT_CHANNEL_REQUEST,
      channelId: this._info.channelId,
      username
    } as RemoveUserFromChatChannelMessage).then(() => {
      return;
    });
  }
}

export type ChatChannelMembership = "public" | "private";

export interface MembershipChatChannelInfo extends ChatChannelInfo {
  readonly channelMembership: ChatChannelMembership;
}

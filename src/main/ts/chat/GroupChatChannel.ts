import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";
import {IChatEvent} from "./events/";

export class GroupChatChannel extends MembershipChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public add(username: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      addUserToChatChannelRequest: {
        channelId: this._info.channelId,
        userToAdd: username
      }
    }).then(() => {
      return;
    });
  }
}

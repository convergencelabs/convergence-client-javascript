import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {ChatEvent} from "./events";

export class SingleUserChatChannel extends ChatChannel {

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: ChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public info(): SingleUserChatInfo {
    const info = super.info();
    const otherUser = info.members.find(username => username !== this.session().username());
    return Object.assign({}, info, {user: otherUser});
  }
}

export declare interface SingleUserChatInfo extends ChatChannelInfo {
  readonly user: string;
}

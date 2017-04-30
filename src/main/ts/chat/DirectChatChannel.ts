import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {ChatEvent} from "./events";

export class DirectChatChannel extends ChatChannel {

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: ChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public info(): DirectChatChannelInfo {
    const info = super.info();
    const otherUsers = info.members.filter(username => username !== this.session().username());
    return Object.assign({}, info, {otherUsers});
  }
}

export interface DirectChatChannelInfo extends ChatChannelInfo {
  readonly otherUsers: string[];
}

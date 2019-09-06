import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChat, MembershipChatInfo} from "./MembershipChat";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";

/**
 * A [[ChatRoom]] is a chat construct where users must be connected and present
 * to receive messages. A chat room does not have members beyond who is in the
 * chat room at any given time. Presence in a chat room is determined by
 * session. If a particular session is not connected and currently in a given
 * room, then messages published to that room will not be delivered to that
 * session.
 *
 * If your session is disconnected while joined to a `ChatRoom`, you will automatically
 * rejoin when connectivity is restored.
 */
export class ChatRoom extends MembershipChat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);

    connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    connection.on(ConvergenceConnection.Events.AUTHENTICATED, this._setOnline);
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    this._join();
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._joined = false;
  }
}

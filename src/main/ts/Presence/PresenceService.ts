import Session from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {UserPresence} from "./UserPresence";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {RemoteSession} from "../RemoteSession";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {IncomingPresenceNormalMessage} from "../connection/protocol/presence/presenceMessage";
import {InitialUserPresence} from "../connection/protocol/authentication";

var Events: any = {
  STATE_SET: "state_set",
  STATE_CLEARED: "state_cleared",
  SESSION_JOINED: "session_joined",
  SESSION_LEFT: "session_left"
};
Object.freeze(Events);

export class PresenceService extends ConvergenceEventEmitter {
  static Events: any = Events;

  private _connection: ConvergenceConnection;
  private _states: {[key: string]: any};
  private _userPresences: {[key: string]: InternalUserPresence};

  constructor(connection: ConvergenceConnection, initialState: InitialUserPresence) {
    super();
    this._connection = connection;
    this._userPresences = {};

    var localPresence: InternalUserPresence = new InternalUserPresence(null, null, null, null);
    this._userPresences[this._connection.session().userId()] = localPresence;
  }

  session(): Session {
    return this._connection.session();
  }

  setState(key: string, value: any): void {
    this._states[key] = value;
    // fixme send message.
  }

  getState(key: string): any {
    return JSON.parse(JSON.stringify(this._states[key]));
  }

  getStates(): {[key: string]: any} {
    return JSON.parse(JSON.stringify(this._states));
  }

  subscribeUser(userId: string): Promise<UserPresence> {
    if (this._userPresences[userId] !== undefined) {
      return Promise.resolve(this._userPresences[userId].createPresence());
    } else {
      // fixme send message
      return Promise.reject(new Error("not implemented"));
    }
  }

  subscribeUsers(userIds: string[]): Promise<{[key: string]: UserPresence}> {
    var cached: {[key: string]: UserPresence} = {};
    var toRequest: string[] = [];

    userIds.forEach((userId: string) => {
      if (this._userPresences[userId] !== undefined) {
        cached[userId] = this._userPresences[userId].createPresence();
      } else {
        toRequest.push(userId);
      }
    });

    if (toRequest.length === 0) {
      return Promise.resolve(cached);
    } else {
      return;
    }
  }

  _handleMessage(messageEvent: MessageEvent): void {
    var message: IncomingPresenceNormalMessage = <IncomingPresenceNormalMessage>messageEvent.message;

    var presence: InternalUserPresence = this._userPresences[message.userId];
    if (presence !== undefined) {
      presence._handleMessage(messageEvent);
    } else {
      // fixme throw error
    }
  }
}

export class InternalUserPresence {

  private _userId: string;
  private _sessions: RemoteSession[];
  private _available: boolean;
  private _state: {[key: string]: any};

  private _subscribers: UserPresence[];

  constructor(userId: string,
              sessions: RemoteSession[],
              available: boolean,
              state: {[key: string]: any}) {
    this._userId = userId;
    this._sessions = sessions;
    this._available = available;
    this._state = state;
    this._subscribers = [];
  }

  userId(): string {
    return this._userId;
  }

  sessions(): RemoteSession[] {
    return this._sessions;
  }

  available(): boolean {
    return this._available;
  }

  states(): {[key: string]: any} {
    return this._state;
  }

  state(key: string): any {
    return this._state[key];
  }

  createPresence(): UserPresence {
    var presence: UserPresence = new UserPresence(this);
    this._subscribers.push(presence);
    return presence;
  }

  unsubscribe(presence: UserPresence): void {
    var i: number = this._subscribers.indexOf(presence);
    if (i >= 0) {
      this._subscribers.splice(i, 1);
    }
  }

  _handleMessage(messageEvent: MessageEvent): void {
    var message: IncomingProtocolMessage = messageEvent.message;

    switch (message.type) {
      // case MessageType.ACTIVITY_SESSION_JOINED:
      //   this._sessionJoined((<ActivitySessionJoined>message).sessionId);
      //   break;
      // case MessageType.ACTIVITY_SESSION_LEFT:
      //   this._sessionLeft((<ActivitySessionLeft>message).sessionId);
      //   break;
      // case MessageType.ACTIVITY_REMOTE_STATE_SET:
      // case MessageType.ACTIVITY_REMOTE_STATE_CLEARED:
      //   this._stateMap._handleMessage(message);
      //   break;
      default:
      // fixme error
    }
  }
}

export interface UserSessionJoinedEvent extends ConvergenceEvent {
  sessionId: string;
}

export interface UserSessionLeftEvent extends ConvergenceEvent {
  sessionId: string;
}

export interface PresenceStateSetEvent extends ConvergenceEvent {
  key: string;
  value: any;
}

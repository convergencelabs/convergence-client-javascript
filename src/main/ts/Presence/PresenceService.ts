import Session from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {UserPresence} from "./UserPresence";
import {UserPresenceList} from "./UserPresenceList";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";

var Events: any = {
  STATE_CHANGED: "state_changed",
  SESSION_JOINED: "session_joined",
  SESSION_LEFT: "session_left"
};
Object.freeze(Events);

export class PresenceService extends ConvergenceEventEmitter {
  static Events: any = Events;

  private _connection: ConvergenceConnection;

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
  }

  session(): Session {
    return this._connection.session();
  }

  setState(key: string, value: any): void {

  }

  getState(key: string): any {

  }

  getStates(): {[key: string]: any} {
    return {};
  }

  getUserPresence(userIds: string[]): {[key: string]: UserPresence} {
    return {};
  }

  presenceList(userIds: string[]): UserPresenceList {
    return;
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

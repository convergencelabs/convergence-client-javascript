import {RemoteSession} from "../RemoteSession";

var Events: any = {
  USER_AVAILABLE: "user_available",
  USER_UNAVAILABLE: "user_unavailable",
  USER_STATE_CHANGED: "user_state_changed",
  SESSION_AVAILABLE: "session_available",
  SESSION_UNAVAILABLE: "session_unavailable"
};
Object.freeze(Events);

export class UserPresence {

  static Events: any = Events;

  private _userId: string;
  private _sessions: RemoteSession[];
  private _available: boolean;
  private _state: {[key: string]: any};

  constructor(userId: string,
              sessions: RemoteSession[],
              available: boolean,
              state: {[key: string]: any}) {
    this._userId = userId;
    this._sessions = sessions;
    this._available = available;
    this._state = state;
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
}

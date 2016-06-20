import {RemoteSession} from "../RemoteSession";
import {InternalUserPresence} from "./PresenceService";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

var Events: any = {
  USER_AVAILABLE: "user_available",
  USER_UNAVAILABLE: "user_unavailable",
  USER_STATE_CHANGED: "user_state_changed",
  SESSION_AVAILABLE: "session_available",
  SESSION_UNAVAILABLE: "session_unavailable"
};
Object.freeze(Events);

export class UserPresence extends ConvergenceEventEmitter {

  static Events: any = Events;

  private _delegate: InternalUserPresence;

  constructor(delegate: InternalUserPresence) {
    super();
    this._delegate = delegate;
  }

  userId(): string {
    return this._delegate.userId();
  }

  sessions(): RemoteSession[] {
    return this._delegate.sessions();
  }

  available(): boolean {
    return this._delegate.available();
  }

  states(): {[key: string]: any} {
    return this._delegate.states();
  }

  state(key: string): any {
    return this._delegate.state(key);
  }

  dispose(): void {
    this._delegate.unsubscribe(this);
    this._delegate = null;
  }

  isDisposed(): boolean {
    return this._delegate === null;
  }

  _emitEvent(event: ConvergenceEvent): void {
    this._emitEvent(event);
  }
}

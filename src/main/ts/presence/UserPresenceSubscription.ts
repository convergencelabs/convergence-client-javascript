import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence, UserPresence} from "./UserPresence";
import {UserPresenceManager} from "./UserPresenceManager";
import {Observable} from "rxjs/Rx";

export class UserPresenceSubscription extends ConvergenceEventEmitter<any> implements UserPresence {

  private _manager: UserPresenceManager;

  constructor(delegate: UserPresenceManager) {
    this._manager = delegate;
    this._emitFrom(delegate.events());
  }

  username(): string {
    return this._manager.username();
  }

  isAvailable(): boolean {
    return this._manager.isAvailable();
  }

  state(key: string): any
  state(): Map<string, any>
  state(key?: string): any {
    return this._manager.state(key);
  }

  asObservable(): Observable<UserPresence> {
    return this._manager.asObservable();
  }

  unsubscribe() {
    this._manager.unsubscribe(this);
  }
}

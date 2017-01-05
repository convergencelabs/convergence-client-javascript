import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {UserPresence} from "./UserPresence";
import {UserPresenceManager} from "./UserPresenceManager";
import {Observable} from "rxjs/Rx";

export interface UserPresenceSubscriptionEvents {
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
  AVAILABILITY_CHANGED: string;
}

export class UserPresenceSubscription extends ConvergenceEventEmitter<ConvergenceEvent> implements UserPresence {

  public static readonly Events: UserPresenceSubscriptionEvents = {
    STATE_SET: "state_set",
    STATE_REMOVED: "state_removed",
    STATE_CLEARED: "state_cleared",
    AVAILABILITY_CHANGED: "availability_changed",
  };

  private _manager: UserPresenceManager;

  constructor(delegate: UserPresenceManager) {
    super();
    this._manager = delegate;
    this._emitFrom(delegate.events());
  }

  public username(): string {
    return this._manager.username();
  }

  public isAvailable(): boolean {
    return this._manager.isAvailable();
  }

  public state(key: string): any
  public state(): Map<string, any>
  public state(key?: string): any {
    return this._manager.state(key);
  }

  public asObservable(): Observable<UserPresence> {
    return this._manager.asObservable();
  }

  public unsubscribe(): void {
    if (this._manager !== null) {
      this._manager.unsubscribe(this);
    }
    this._manager = null;
  }
}

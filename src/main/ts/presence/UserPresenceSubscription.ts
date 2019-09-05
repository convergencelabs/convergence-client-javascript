import {ConvergenceEventEmitter} from "../util/";
import {UserPresence} from "./UserPresence";
import {UserPresenceManager} from "./UserPresenceManager";
import {Observable} from "rxjs";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent, IPresenceEvent
} from "./events/";
import {DomainUser} from "../identity";

export interface UserPresenceSubscriptionEvents {
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
  AVAILABILITY_CHANGED: string;
}

/**
 * The [[UserPresenceSubscription]] represents the subscription to the presence
 * of a specific Domain User.
 */
export class UserPresenceSubscription extends ConvergenceEventEmitter<IPresenceEvent> {

  public static readonly Events: UserPresenceSubscriptionEvents = {
    STATE_SET: PresenceStateSetEvent.NAME,
    STATE_REMOVED: PresenceStateRemovedEvent.NAME,
    STATE_CLEARED: PresenceStateClearedEvent.NAME,
    AVAILABILITY_CHANGED: PresenceAvailabilityChangedEvent.NAME,
  };

  /**
   * @internal
   */
  private _manager: UserPresenceManager;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: UserPresenceManager) {
    super();
    this._manager = delegate;
    this._emitFrom(delegate.events());
  }

  public get user(): DomainUser {
    return this._manager.user();
  }

  public get available(): boolean {
    return this._manager.isAvailable();
  }

  public get state(): Map<string, any> {
    return this._manager.state();
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

import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export interface UserPresenceSubscriptionEvents {
  readonly STATE_SET: string;
  readonly STATE_REMOVED: string;
  readonly STATE_CLEARED: string;
  readonly AVAILABILITY_CHANGED: string;
}

export declare class UserPresenceSubscription extends ConvergenceEventEmitter<ConvergenceEvent> {

  public readonly username: string;

  public readonly available: boolean;

  public readonly state: Map<string, any>;

  public asObservable(): Observable<UserPresence>;

  public unsubscribe(): void;
}

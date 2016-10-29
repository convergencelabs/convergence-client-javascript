import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence, UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class UserPresenceSubscription extends ConvergenceEventEmitter<any> implements UserPresence {

  username(): string;

  isAvailable(): boolean;

  state(key: string): any;

  state(): Map<string, any>;

  asObservable(): Observable<UserPresence>;

  unsubscribe();
}

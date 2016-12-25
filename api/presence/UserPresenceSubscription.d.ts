import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence, UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class UserPresenceSubscription extends ConvergenceEventEmitter<any> implements UserPresence {

  public username(): string;

  public isAvailable(): boolean;

  public state(key: string): any;

  public state(): Map<string, any>;

  public asObservable(): Observable<UserPresence>;

  public unsubscribe();
}

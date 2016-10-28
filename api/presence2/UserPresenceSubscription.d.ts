import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class UserPresenceSubscription extends ConvergenceEventEmitter<any> {

  // todo we could to this set of funcitons fro the user presence
  username(): string;

  isAvailable(): boolean;

  state(key: string): any;

  state(): Map<string, any>;

  // todo or we could just do this

  presence(): UserPresence;



  asObservable(): Observable<UserPresence>;

  unsubscribe();
}

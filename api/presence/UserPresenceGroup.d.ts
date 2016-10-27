import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class UserPresenceGroup extends ConvergenceEventEmitter {

  members(): UserPresence[];
  member(id): UserPresence;

  add(id): void;
  remove(id): void

  asObservable(): Observable<UserPresence[]>;

  dispose();
}

import {ObservableEventEmitter} from "../util/ObservableEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class UserPresenceGroup extends ObservableEventEmitter {

  members(): UserPresence[];
  member(id): UserPresence;

  add(id): void;
  remove(id): void

  asObservable(): Observable<UserPresence[]>;

  dispose();
}

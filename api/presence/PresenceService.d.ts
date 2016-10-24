import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class PresenceService extends ConvergenceEventEmitter {

  session(): Session;

  isAvailable(): boolean;

  publish(key: string, value: any): void;

  clear(key: string): void;

  state(key: string): any;
  state(): Map<string,any>;

  presence(username: string): Promise<UserPresence>;
  presence(usernames: string[]): Promise<UserPresence[]>;

  presenceStream(username: string): Observable<UserPresence>;
  presenceStream(usernames: string[]): Observable<UserPresence>[];
}

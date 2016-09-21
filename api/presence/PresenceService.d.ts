import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/Rx";

export declare class PresenceService extends ConvergenceEventEmitter {
  session(): Session;

  publish(key: string, value: any): void;

  clear(key: string): void;

  localPresence(): Observable<UserPresence>;

  // todo I think we can collapse these two methods and assume that the
  // caller can just use combineLatest?
  presence(username: string): Observable<UserPresence>;

  presences(usernames: string[]): Observable<UserPresence[]>;


  localPresenceStream(): Observable<UserPresence>;

  presenceStream(username: string): Observable<UserPresence>;

  presenceStreams(usernames: string[]): Observable<UserPresence>[];

  // todo is there a way to collapse the streaming and non-streaming
  // versions?
}

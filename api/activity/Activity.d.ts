import {Session} from "../Session";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivityParticipant} from "./ActivityParticipant";
import {ObservableEventEmitter} from "../util/ObservableEventEmitter";

export declare class Activity extends ObservableEventEmitter<ActivityEvent> {
  static Events: any;

  session(): Session;

  id(): string;

  leave(): void;

  isJoined(): boolean;

  publish(state: Map<string, any>): void;
  publish(key: string, value: any): void;

  // fixme how do I set the state all at once?

  clear(key: string): void;
  clear(keys: string[]): void;
  clear(): void; // fixme clears all the state?

  participant(sessionId: string): ActivityParticipant;
  participants(): ActivityParticipant[];

  asObservable(): Observable<ActivityParticipant[]>;
}

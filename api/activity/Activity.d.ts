import {Session} from "../Session";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivityParticipant} from "./ActivityParticipant";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export declare class Activity extends ConvergenceEventEmitter<ActivityEvent> {
  static Events: any;

  session(): Session;

  id(): string;

  leave(): void;
  isJoined(): boolean;


  set(state: Map<string, any>): void;
  set(key: string, value: any): void;

  remove(key: string): void;
  remove(keys: string[]): void;

  clear(): void;

  // fixme name this
  replace(state: Map<string, any>);

  state(key: string): any;
  state(): Map<string,any>;


  participant(sessionId: string): ActivityParticipant;
  participants(): ActivityParticipant[];

  asObservable(): Observable<ActivityParticipant[]>;
}

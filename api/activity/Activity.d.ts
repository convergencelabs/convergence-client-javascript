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


  setState(state: {[key: string]: any}): void;
  setState(key: string, value: any): void;

  removeState(key: string): void;
  removeState(keys: string[]): void;

  clearState(): void;

  // TODO
  //replaceState(state: Map<string, any>);

  state(key: string): any;
  state(): {[key: string]: any};


  participant(sessionId: string): ActivityParticipant;
  participants(): ActivityParticipant[];

  participantsAsObservable(): Observable<ActivityParticipant[]>;
}

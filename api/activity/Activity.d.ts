import {Session} from "../Session";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivityParticipant} from "./ActivityParticipant";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {StringMapLike} from "../util/StringMap";

export declare interface ActivityEvents {
  readonly SESSION_JOINED: string;
  readonly SESSION_LEFT: string;
  readonly STATE_SET: string;
  readonly STATE_REMOVED: string;
  readonly STATE_CLEARED: string;
}

export declare class Activity extends ConvergenceEventEmitter<ActivityEvent> {

  public static readonly Events: ActivityEvents;

  public session(): Session;

  public id(): string;

  public leave(): void;
  public isJoined(): boolean;

  public state(key: string): any;
  public state(): Map<string, any>;

  public setState(state: StringMapLike): void;
  public setState(key: string, value: any): void;

  public removeState(key: string): void;
  public removeState(keys: string[]): void;

  public clearState(): void;

  public participant(sessionId: string): ActivityParticipant;
  public participants(): ActivityParticipant[];

  public participantsAsObservable(): Observable<ActivityParticipant[]>;
}

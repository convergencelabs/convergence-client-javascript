import {Session} from "../Session";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivityParticipant} from "./ActivityParticipant";
import {ObservableEventEmitter} from "../util/ObservableEventEmitter";

export declare class Activity extends ObservableEventEmitter<ActivityEvent> {
  static Events: any;

  session(): Session;

  id(): string;

  join(options?: ActivityJoinOptions): void;

  leave(): void;

  isJoined(): boolean;

  publish(state: Map<string, any>): void;
  publish(key: string, value: any): void;

  clear(key: string): void;
  clear(keys: string[]): void;

  participants(): Observable<ActivityParticipant[]>;

  // todo there is some work here, we need to discuss this common pattern
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}

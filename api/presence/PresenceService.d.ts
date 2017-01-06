import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {UserPresence} from "./UserPresence";
import {UserPresenceSubscription} from "./UserPresenceSubscription";

export interface PresenceServiceEvents {
  readonly STATE_SET: string;
  readonly STATE_REMOVED: string;
  readonly STATE_CLEARED: string;
  readonly AVAILABILITY_CHANGED: string;
}

export declare class PresenceService extends ConvergenceEventEmitter<ConvergenceEvent> {

  public static readonly Events: PresenceServiceEvents;

  public session(): Session;

  public isAvailable(): boolean;

  public setState(state: {[key: string]: any}): void;
  public setState(key: string, value: any): void;

  // public replace(state: Map<string, any>);

  public removeState(key: string): void;
  public removeState(keys: string[]): void;

  public clearState(): void;

  public state(key: string): any;
  public state(): {[key: string]: any};

  public presence(username: string): Promise<UserPresence>;
  public presence(usernames: string[]): Promise<UserPresence[]>;

  public subscribe(username: string): Promise<UserPresenceSubscription>;
  public subscribe(usernames: string[]): Promise<UserPresenceSubscription[]>;
}

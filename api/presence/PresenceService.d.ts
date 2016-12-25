import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {UserPresenceSubscription} from "./UserPresenceSubscription";

export declare class PresenceService extends ConvergenceEventEmitter {

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

import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {UserPresenceSubscription} from "./UserPresenceSubscription";

export declare class PresenceService extends ConvergenceEventEmitter {

  session(): Session;

  isAvailable(): boolean;

  set(state: Map<string, any>): void;
  set(key: string, value: any): void;

  remove(key: string): void;
  remove(keys: string[]): void;

  clear(): void;

  replace(state: Map<string, any>);

  state(key: string): any;
  state(): Map<string,any>;


  presence(username: string): Promise<UserPresence>;
  presence(usernames: string[]): Promise<UserPresence[]>;

  subscribe(username: string): Promise<UserPresenceSubscription>;
  subscribe(usernames: string[]): Promise<UserPresenceSubscription[]>;
}

import {Session} from "../Session";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {UserPresenceSubscription} from "./UserPresenceSubscription";

export declare class PresenceService extends ConvergenceEventEmitter {

  session(): Session;

  isAvailable(): boolean;

  setState(state: {[key: string]: any}): void;
  setState(key: string, value: any): void;

  //replace(state: Map<string, any>);

  removeState(key: string): void;
  removeState(keys: string[]): void;

  clearState(): void;

  state(key: string): any;
  state(): {[key: string]: any};


  presence(username: string): Promise<UserPresence>;
  presence(usernames: string[]): Promise<UserPresence[]>;

  subscribe(username: string): Promise<UserPresenceSubscription>;
  subscribe(usernames: string[]): Promise<UserPresenceSubscription[]>;
}

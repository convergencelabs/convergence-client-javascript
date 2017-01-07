import {UserPresence} from "./UserPresence";
import {deepClone} from "../util/ObjectUtils";

export class UserPresenceImpl implements UserPresence {

  private _username: string;
  private _available: boolean;
  private _state: Map<string, any>;

  constructor(username: string, available: boolean, state: Map<string, any>) {
    this._username = username;
    this._available = available;
    this._state = deepClone(state);
  }

  public username(): string {
    return this._username;
  }

  public isAvailable(): boolean {
    return this._available;
  }

  public state(key: string): any
  public state(): Map<string, any>
  public state(key?: string): any {
    if (typeof key === "undefined") {
      return deepClone(this._state);
    } else {
      return deepClone(this._state.get(key));
    }
  }
}

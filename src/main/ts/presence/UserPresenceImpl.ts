import {UserPresence} from "./UserPresence";

export class UserPresenceImpl implements UserPresence {

  private _username: string;
  private _available: boolean;
  private _state: Map<string, any>;

  constructor(username: string, available: boolean, state: Map<string, any>) {
    this._username = username;
    this._available = available;
    this._state = state; // TODO copy
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
    // FIXME make result be cloned / immutable.
    if (typeof key === "undefined") {
      return this._state;
    } else {
      return this._state.get(key);
    }
  }
}

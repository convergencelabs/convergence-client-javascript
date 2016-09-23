export class UserPresence {
  private _username: string;
  private _available: boolean;
  private _state: Map<string, any>;

  constructor(username: string, available: boolean, state: Map<string, any>) {
    this._username = username;
    this._available = available;
    this._state = state; // TODO copy
  }

  username(): string {
    return this._username;
  }

  available(): boolean {
    return this._available;
  }

  state(key: string): any
  state(): Map<string, any>
  state(key?: string): any{
    // FIXME make result be cloned / immutable.
    if (typeof key === "undefined") {
      return this._state;
    } else {
      return this._state[key];
    }
  }
}

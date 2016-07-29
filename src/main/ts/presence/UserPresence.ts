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

  state(): Map<string, any> {
    return this._state;
  }
}

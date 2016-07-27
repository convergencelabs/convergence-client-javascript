export class UserPresence {
  private _userId: string;
  private _available: boolean;
  private _state: Map<string, any>;

  constructor(userId: string, available: boolean, state: Map<string, any>) {
  }

  userId(): string {
    return this._userId;
  }

  available(): boolean {
    return this._available;
  }

  state(): Map<string, any> {
    return this._state;
  }
}

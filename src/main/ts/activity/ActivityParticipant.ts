export class ActivityParticipant {

  private _username: string;
  private _sessionId: string;
  private _stateMap: Map<string, any>;

  constructor(username: string, session: string, stateMap: Map<string, any>) {
    this._username = username;
    this._sessionId = session;
    this._stateMap = stateMap;
  }

  public username(): string {
    return this._username;
  }

  public sessionId(): string {
    return this._sessionId;
  }

  public state(): Map<string, any>
  public state(key?: string): any {
    if (key !== undefined) {
      return this._stateMap[key];
    } else {
      return this._stateMap;
    }
  }
}

import {deepClone} from "../util/ObjectUtils";
export class ActivityParticipant {

  private _username: string;
  private _sessionId: string;
  private _stateMap: Map<string, any>;
  private _local;

  constructor(session: string, username: string, stateMap: Map<string, any>, local: boolean) {
    this._local = local;
    this._username = username;
    this._sessionId = session;
    this._stateMap = deepClone(stateMap);
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
      return deepClone(this._stateMap[key]);
    } else {
      return deepClone(this._stateMap);
    }
  }

  public isLocal(): boolean {
    return this._local;
  }
}

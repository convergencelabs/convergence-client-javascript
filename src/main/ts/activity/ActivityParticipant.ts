import {deepClone} from "../util/ObjectUtils";
export class ActivityParticipant {

  private _state: Map<string, any>;

  constructor(public readonly sessionId: string,
              public readonly username: string,
              state: Map<string, any>,
              public readonly local: boolean) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}

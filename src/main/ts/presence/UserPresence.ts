import {deepClone} from "../util/ObjectUtils";

export class UserPresence {

  private readonly _state: Map<string, any>;

  constructor(public readonly username: string,
              public readonly available: boolean,
              state: Map<string, any>) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}

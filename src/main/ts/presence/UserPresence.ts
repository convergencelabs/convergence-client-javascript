import {deepClone} from "../util/ObjectUtils";

export class UserPresence {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param username
   * @param available
   * @param state
   *
   * @hidden
   * @internal
   */
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

import {deepClone} from "../util/ObjectUtils";
import {DomainUser} from "../identity";

export class UserPresence {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param user
   * @param available
   * @param state
   *
   * @hidden
   * @internal
   */
  constructor(public readonly user: DomainUser,
              public readonly available: boolean,
              state: Map<string, any>) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}

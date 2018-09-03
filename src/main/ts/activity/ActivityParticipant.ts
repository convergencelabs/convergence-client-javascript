import {deepClone} from "../util/ObjectUtils";
export class ActivityParticipant {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @hidden
   * @internal
   */
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

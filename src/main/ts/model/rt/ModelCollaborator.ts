import {DomainUser} from "../../identity";

/**
 * The [[ModelCollaborator]] represents a user / session that has opened
 * a given model for shared editing.
 *
 * @category Real Time Data Subsystem
 */
export class ModelCollaborator {
  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The user of the [[ModelCollaborator]].
     */
    public readonly user: DomainUser,

    /**
     * The sessionId of the [[ModelCollaborator]].
     */
    public readonly sessionId: string
  ) {
    Object.freeze(this);
  }
}

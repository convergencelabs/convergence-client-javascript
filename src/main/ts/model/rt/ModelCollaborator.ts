/**
 * The [[ModelCollaborator]] represents a user / session that has opened
 * a given model for shared editing.
 */
import {DomainUser} from "../../identity";

export class ModelCollaborator {
  /**
   * @param user
   *   The user of the [[ModelCollaborator]].
   * @param sessionId
   *   The sessionId of the [[ModelCollaborator]].
   *
   * @hidden
   * @internal
   */
  constructor(public readonly user: DomainUser,
              public readonly sessionId: string) {
    Object.freeze(this);
  }
}

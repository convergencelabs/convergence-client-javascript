/**
 * The [[ModelCollaborator]] represents a user / session that has opened
 * a given model for shared editing.
 */
export class ModelCollaborator {
  /**
   * @param username
   *   The username of the [[ModelCollaborator]].
   * @param sessionId
   *   The sessionId of the [[ModelCollaborator]].
   *
   * @hidden
   * @internal
   */
  constructor(public readonly username: string, public readonly sessionId: string) {
    Object.freeze(this);
  }
}

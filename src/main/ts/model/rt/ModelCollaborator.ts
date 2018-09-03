export class ModelCollaborator {
  /**
   * @param username
   * @param sessionId
   * @hidden
   * @internal
   */
  constructor(public readonly username: string, public readonly sessionId: string) {
    Object.freeze(this);
  }
}

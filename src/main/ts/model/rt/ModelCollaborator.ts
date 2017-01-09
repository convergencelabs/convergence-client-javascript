export class ModelCollaborator {
  constructor(public readonly username: string, public readonly sessionId: string) {
    Object.freeze(this);
  }
}

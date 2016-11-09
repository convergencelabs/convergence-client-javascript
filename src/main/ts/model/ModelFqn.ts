export class ModelFqn {

  /**
   * Constructs a new ModelFqn.
   */
  constructor(public collectionId: string, public modelId: string) {
    Object.freeze(this);
  }

  public hash(): string {
    return this.collectionId + "/" + this.modelId;
  }
}

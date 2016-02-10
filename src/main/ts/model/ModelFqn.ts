export default class ModelFqn {

  /**
   * Constructs a new ModelFqn.
   */
  constructor(public collectionId: string, public modelId: string) {
    Object.freeze(this);
  }

  hash(): string {
    return this.collectionId + "/" + this.modelId;
  }
}

export default class ModelFqn {

  /**
   * Constructs a new ModelFqn.
   */
  constructor(public collectionId: string, public modelId: string) {
    Object.freeze(this);
  }
}

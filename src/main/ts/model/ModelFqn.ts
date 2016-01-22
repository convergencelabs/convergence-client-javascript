module convergence.model {

  export class ModelFqn {

    /**
     * Constructs a new RealTimeModel.
     */
    constructor(private _collectionId: string, private _modelId: string) {
    }

    get collectionId(): string {
      return this._collectionId;
    }

    get modelId(): string {
      return this._modelId;
    }
  }
}

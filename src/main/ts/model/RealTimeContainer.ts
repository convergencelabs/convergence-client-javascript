/// <reference path="RealTimeData.ts" />
/// <reference path="../util/EventEmitter.ts" />

module convergence.model {

  export abstract class RealTimeContainer extends RealTimeData {

    /**
     * Constructs a new RealTimeContainer.
     */
    constructor(modelType: DataType, parent: RealTimeContainer, fieldInParent: PathElement) {
      super(modelType, parent, fieldInParent);
    }

  }
}

/// <reference path="RealTimeData.ts" />
/// <reference path="../util/EventEmitter.ts" />

module convergence.model {

  import DiscreteOperation = convergence.ot.DiscreteOperation;
  export abstract class RealTimeContainer extends RealTimeData {

    /**
     * Constructs a new RealTimeContainer.
     */
    constructor(modelType: DataType,
                parent: RealTimeContainer,
                fieldInParent: PathElement,
                sendOpCallback: (operation: DiscreteOperation) => void) {
      super(modelType, parent, fieldInParent, sendOpCallback);
    }

  }
}

/// <reference path="RealTimeData.ts" />

module convergence.model {

  import DiscreteOperation = convergence.ot.DiscreteOperation;
  export class RealTimeNull extends RealTimeData {

    /**
     * Constructs a new RealTimeNull.
     */
    constructor(parent: RealTimeContainer,
                fieldInParent: PathElement,
                sendOpCallback: (operation: DiscreteOperation) => void) {
      super(DataType.Null, parent, fieldInParent, sendOpCallback);
    }

    value(): any {
      return null;
    }

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      throw new Error("Method not implemented exception!");
    }
  }
}

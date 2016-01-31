/// <reference path="RealTimeData.ts" />

module convergence.model {

  import DiscreteOperation = convergence.ot.DiscreteOperation;
  export class RealTimeUndefined extends RealTimeData {

    /**
     * Constructs a new RealTimeUndefined.
     */
    constructor(parent: RealTimeContainer,
                fieldInParent: PathElement,
                sendOpCallback: (operation: DiscreteOperation) => void) {
      super(DataType.Undefined, parent, fieldInParent, sendOpCallback);
    }

    value(): any {
      return undefined;
    }

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      throw new Error("Method not implemented exception!");
    }
  }

}

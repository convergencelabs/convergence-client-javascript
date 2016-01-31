/// <reference path="RealTimeData.ts" />

module convergence.model {

  export class RealTimeNull extends RealTimeData {

    /**
     * Constructs a new RealTimeNull.
     */
    constructor(parent: RealTimeData, fieldInParent: PathElement) {
      super(DataType.Null, parent, fieldInParent);
    }

    value(): any {
      return null;
    }

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      throw new Error("Method not implemented exception!");
    }
  }
}

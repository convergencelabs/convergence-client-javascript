/// <reference path="RealTimeData.ts" />

module convergence.model {

  export class RealTimeUndefined extends RealTimeData {

    /**
     * Constructs a new RealTimeUndefined.
     */
    constructor(parent: RealTimeData, fieldInParent: string|number) {
      super(DataType.Undefined, parent, fieldInParent);
    }

    value(): any {
      return undefined;
    }

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      throw new Error("Method not implemented exception!");
    }
  }

}

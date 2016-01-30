module convergence.model {

  export class RealTimeUndefined extends RealTimeData {

    /**
     * Constructs a new RealTimeUndefined.
     */
    constructor(parent: RealTimeData, fieldInParent: string|number) {
      super(DataType.Undefined, parent, fieldInParent);
    }
  }
}

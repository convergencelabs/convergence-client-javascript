module convergence.model {

  export class RealTimeNull extends RealTimeData {

    /**
     * Constructs a new RealTimeNull.
     */
    constructor(parent: RealTimeData, fieldInParent: string|number) {
      super(DataType.Null, parent, fieldInParent);
    }
  }
}

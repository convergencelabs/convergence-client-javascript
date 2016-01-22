module convergence.model {

  export class RealTimeNull extends Model {

    /**
     * Constructs a new RealTimeNull.
     */
    constructor(parent: Model, fieldInParent: any) {
      super(ModelType.Null, parent, fieldInParent);
    }
  }
}

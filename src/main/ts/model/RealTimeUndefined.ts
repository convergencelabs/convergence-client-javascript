module convergence.model {

  export class RealTimeUndefined extends Model {

    /**
     * Constructs a new RealTimeNull.
     */
    constructor(parent: Model, fieldInParent: string|number) {
      super(ModelType.Undefined, parent, fieldInParent);
    }
  }
}

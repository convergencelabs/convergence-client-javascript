module convergence.model {

  export class RealTimeBoolean extends Model {

    /**
     * Constructs a new RealTimeBoolean.
     */
    constructor(private data: boolean, parent: Model, fieldInParent: any) {
      super(ModelType.Boolean, parent, fieldInParent);
    }
  }
}

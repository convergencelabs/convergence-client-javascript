module convergence.model {

  export class RealTimeString extends Model {

    /**
     * Constructs a new RealTimeString.
     */
    constructor(private data: string, parent: Model, fieldInParent: any) {
      super(ModelType.String, parent, fieldInParent);
    }

  }
}
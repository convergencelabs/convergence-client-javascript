module convergence.model {

  export class RealTimeNumber extends Model {

    /**
     * Constructs a new RealTimeNumber.
     */
    constructor(private data: number, parent: Model, fieldInParent: any) {
      super(ModelType.Number, parent, fieldInParent);
    }

  }
}
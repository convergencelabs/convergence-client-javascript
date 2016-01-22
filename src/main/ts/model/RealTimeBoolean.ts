module convergence.model {

  import BooleanSetOperation = convergence.ot.BooleanSetOperation;

  export class RealTimeBoolean extends Model {

    /**
     * Constructs a new RealTimeBoolean.
     */
    constructor(private data: boolean, parent: Model, fieldInParent: any) {
      super(ModelType.Boolean, parent, fieldInParent);
    }

    /**
     * Sets the value of the RealTimeBoolean
     * @param {boolean} value The new value.
     */
    setValue(value: boolean): void {
      if (typeof value !== "boolean") {
        throw new Error("Value must be a boolean");
      }

      var operation = new BooleanSetOperation(this.path(), false, value);
      this.data = value;
      // TODO: send operation
    }
  }
}

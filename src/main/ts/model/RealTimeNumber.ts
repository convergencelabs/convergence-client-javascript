module convergence.model {

  import NumberAddOperation = convergence.ot.NumberAddOperation;
  import NumberSetOperation = convergence.ot.NumberSetOperation;
  export class RealTimeNumber extends Model {

    /**
     * Constructs a new RealTimeNumber.
     */
    constructor(private data: number, parent: Model, fieldInParent: string|number) {
      super(ModelType.Number, parent, fieldInParent);
    }

    /**
     * Adds the value to the RealTimeNumber.
     * @param {number} a number to add
     */
    add(value: number): void {
      if (isNaN(value)) {
        throw new Error("Value is NaN");
      }

      if (value !== 0) {
        var operation = new NumberAddOperation(this.path(), false, value);
        this.data += value;
        // TODO: send operation
      }
    }

    /**
     * Subtracts the value from the RealTimeNumber.
     * @param {number} a number to subtract
     */
    subtract(value: number): void {
      this.add(-value);
    }

    /**
     * Increments the value of this RealTimeNumber by 1.
     */
    increment(): void {
      this.add(1);
    }

    /**
     * Decrements the value of this RealTimeNumber by 1.
     */
    decrement(): void {
      this.add(-1);
    }

    /**
     * Sets the value of the RealTimeNumber
     * @param {Number} value The new value.
     */
    setValue(value: number): void {
      if (isNaN(value)) {
        throw new Error("Value is NaN");
      }

      var operation = new NumberSetOperation(this.path(), false, value);
      this.data = value;
      // TODO: send operation
    }
  }
}

module convergence.model {

  import StringInsertOperation = convergence.ot.StringInsertOperation;
  import StringRemoveOperation = convergence.ot.StringRemoveOperation;
  export class RealTimeString extends RealTimeData {

    /**
     * Constructs a new RealTimeString.
     */
    constructor(private data: string, parent: RealTimeData, fieldInParent: string|number) {
      super(DataType.String, parent, fieldInParent);
    }

    /**
     * Inserts characters into the RealTimeString
     * @param {number} index - The index to insert at
     * @param {string} value - The value to insert
     */
    insert(index: number, value: string): void {
      // TODO: Add integer check
      if (this.data.length < index || index < 0) {
        throw new Error("Index out of bounds!");
      }

      if (typeof value !== "string") {
        throw new Error("Value must be a string");
      }

      var operation = new StringInsertOperation(this.path(), false, index, value);
      this.data = this.data.slice(0, index) + value + this.data.slice(index, this.data.length);
      // TODO: send operation
    }

    /**
     * Removes characters from the RealTimeString
     * @param {number} index - The start index of the characters to remove
     * @param {number} length - The number of characters to remove
     */
    remove(index: number, length: number): void {
      // TODO: Add integer check
      if (this.data.length <= index + length || index < 0) {
        throw new Error("Index out of bounds!");
      }

      var operation = new StringRemoveOperation(this.path(), false, index, this.data.substr(index, length));
      this.data = this.data.slice(0, index) + this.data.slice(index + length, this.data.length);
      // TODO: send operation
    }


    /**
     * @return {number} The length of the RealTimeString
     */
    length(): number {
      return this.data.length;
    }
  }
}

/// <reference path="RealTimeData.ts" />
/// <reference path="../ot/ops/StringInsertOperation.ts" />
/// <reference path="../ot/ops/StringRemoveOperation.ts" />

module convergence.model {

  import StringInsertOperation = convergence.ot.StringInsertOperation;
  import StringRemoveOperation = convergence.ot.StringRemoveOperation;
  import StringSetOperation = convergence.ot.StringSetOperation;
  import StringInsertEvent = convergence.model.event.StringInsertEvent;
  import StringRemoveEvent = convergence.model.event.StringRemoveEvent;
  import StringSetEvent = convergence.model.event.StringSetEvent;
  import DiscreteOperation = convergence.ot.DiscreteOperation;

  enum Events {Insert, Remove, Set}

  export class RealTimeString extends RealTimeData {

    /**
     * Constructs a new RealTimeString.
     */
    constructor(private data: string,
                parent: RealTimeContainer,
                fieldInParent: PathElement,
                sendOpCallback: (operation: DiscreteOperation) => void) {
      super(DataType.String, parent, fieldInParent, sendOpCallback);
    }

    /**
     * Inserts characters into the RealTimeString
     * @param {number} index - The index to insert at
     * @param {string} value - The value to insert
     */
    insert(index: number, value: string): void {
      this._validateInsert(index, value);

      var operation: StringInsertOperation = new StringInsertOperation(this.path(), false, index, value);
      this.data = this.data.slice(0, index) + value + this.data.slice(index, this.data.length);
      this.sendOpCallback(operation);
    }

    /**
     * Removes characters from the RealTimeString
     * @param {number} index - The start index of the characters to remove
     * @param {number} length - The number of characters to remove
     */
    remove(index: number, length: number): void {
      this._validateRemove(index);

      var operation: StringRemoveOperation = new StringRemoveOperation(this.path(), false, index, this.data.substr(index, length));
      this.data = this.data.slice(0, index) + this.data.slice(index + length, this.data.length);
      this.sendOpCallback(operation);
    }

    setValue(value: string): void {
      this._validateSet(value);

      this.data = value;
      var operation: StringSetOperation = new StringSetOperation(this.path(), false, value);
      this.sendOpCallback(operation);
    }


    /**
     * @return {number} The length of the RealTimeString
     */
    length(): number {
      return this.data.length;
    }

    value(): string {
      return this.data;
    }

    protected _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      var type: string = operationEvent.operation.type;
      if (type === StringInsertOperation.TYPE) {
        this._handleInsertOperation(operationEvent);
      } else if (type === StringRemoveOperation.TYPE) {
        this._handleRemoveOperation(operationEvent);
      } else if (type === StringSetOperation.TYPE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    }

    private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
      var operation: StringInsertOperation = <StringInsertOperation> operationEvent.operation;
      var index: number = operation.index;
      var value: string = operation.value;

      this._validateInsert(index, value);

      this.data = this.data.slice(0, index) + value + this.data.slice(index, this.data.length);

      var event: StringInsertEvent = new StringInsertEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          index,
          value);
      this.emit(Events[Events.Insert], event);
    }

    private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
      var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
      var index: number = operation.index;
      var value: string = operation.value;

      this._validateRemove(index);

      this.data = this.data.slice(0, index) + this.data.slice(index + length, this.data.length);

      var event: StringRemoveEvent = new StringRemoveEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          index,
          value);
      this.emit(Events[Events.Remove], event);
    }

    private _handleSetOperation(operationEvent: ModelOperationEvent): void {
      var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
      var value: string = operation.value;

      this._validateSet(value);
      this.data = value;

      var event: StringSetEvent = new StringSetEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          value);
      this.emit(Events[Events.Set], event);
    }

    private _validateInsert(index: number, value: string): void {
      // TODO: Add integer check
      if (this.data.length < index || index < 0) {
        throw new Error("Index out of bounds!");
      }

      if (typeof value !== "string") {
        throw new Error("Value must be a string");
      }
    }

    private _validateRemove(index: number): void {
      // TODO: Add integer check
      if (this.data.length <= index + length || index < 0) {
        throw new Error("Index out of bounds!");
      }
    }

    private _validateSet(value: string): void {
      if (typeof value !== "string") {
        throw new Error("Value must be a string");
      }
    }
  }
}

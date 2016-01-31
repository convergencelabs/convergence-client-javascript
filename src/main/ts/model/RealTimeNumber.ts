/// <reference path="RealTimeData.ts" />
/// <reference path="../ot/ops/NumberAddOperation.ts" />
/// <reference path="../ot/ops/NumberSetOperation.ts" />
/// <reference path="events/NumberSetEvent.ts" />
/// <reference path="events/NumberAddEvent.ts" />

module convergence.model {

  import NumberAddOperation = convergence.ot.NumberAddOperation;
  import NumberSetOperation = convergence.ot.NumberSetOperation;

  import NumberSetEvent = convergence.model.event.NumberSetEvent;
  import NumberAddEvent = convergence.model.event.NumberAddEvent;


  // TODO: Decide what events we want for numbers.
  enum Events {Add, Set}

  export class RealTimeNumber extends RealTimeData {

    /**
     * Constructs a new RealTimeNumber.
     */
    constructor(private data: number, parent: RealTimeData, fieldInParent: PathElement) {
      super(DataType.Number, parent, fieldInParent);
    }

    /**
     * Adds the value to the RealTimeNumber.
     * @param {number} a number to add
     */
    add(value: number): void {
      this._validateNumber(value);

      if (value !== 0) {
        var operation: NumberAddOperation = new NumberAddOperation(this.path(), false, value);
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

      var operation: NumberSetOperation = new NumberSetOperation(this.path(), false, value);
      this.data = value;
      // TODO: send operation
    }

    value(): number {
      return this.data;
    }

    // Handlers for incoming operations

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      var type: string = operationEvent.operation.type;
      if (type === NumberAddOperation.TYPE) {
        this._handleAddOperation(operationEvent);
      } else if (type === NumberSetOperation.TYPE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    }

    private _handleAddOperation(operationEvent: ModelOperationEvent): void {
      var operation: NumberAddOperation = <NumberAddOperation> operationEvent.operation;
      var value: number = operation.value;

      this._validateNumber(value);
      this.data += value;

      var event: NumberAddEvent = new NumberAddEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          value);
      this.emit(Events[Events.Add], event);
    }

    private _handleSetOperation(operationEvent: ModelOperationEvent): void {
      var operation: NumberSetOperation = <NumberSetOperation> operationEvent.operation;
      var value: number = operation.value;

      this._validateNumber(value);
      this.data += value;

      var event: NumberSetEvent = new NumberSetEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          value);
      this.emit(Events[Events.Set], event);
    }

    private _validateNumber(value: number): void {
      if (isNaN(value)) {
        throw new Error("Value is NaN");
      }
    }
  }
}

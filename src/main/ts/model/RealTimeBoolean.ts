import RealTimeData from "./RealTimeData";

enum Events {Set}

export default class RealTimeBoolean extends RealTimeData {

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(private data: boolean,
              parent: RealTimeContainer,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(DataType.Boolean, parent, fieldInParent, sendOpCallback);
  }

  /**
   * Sets the value of the RealTimeBoolean
   * @param {boolean} value The new value.
   */
  setValue(value: boolean): void {
    this._validateSet(value);

    var operation: BooleanSetOperation = new BooleanSetOperation(this.path(), false, value);
    this.data = value;
    this.sendOpCallback(operation);
  }

  value(): boolean {
    return this.data;
  }

  // Handlers for incoming operations

  _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === BooleanSetOperation.TYPE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: BooleanSetOperation = <BooleanSetOperation> operationEvent.operation;
    var value: boolean = operation.value;

    this._validateSet(value);
    this.data = value;

    var event: BooleanSetEvent = new BooleanSetEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      value);
    this.emit(Events[Events.Set], event);
  }

  private _validateSet(value: boolean): void {
    if (typeof value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }
}

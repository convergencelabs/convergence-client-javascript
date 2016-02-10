import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import BooleanSetOperation from "../ot/ops/BooleanSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import BooleanSetEvent from "./events/BooleanSetEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";


export default class RealTimeBoolean extends RealTimeValue<boolean> {

  static Events: any = {
    SET: "set"
  };

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(private data: boolean,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Boolean, parent, fieldInParent, sendOpCallback);
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

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: string = operationEvent.operation.type;
      if (type === BooleanSetOperation.TYPE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      throw new Error("Invalid path: boolean values do not have children");
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
    this.emit(RealTimeBoolean.Events.SET, event);

  }

  private _validateSet(value: boolean): void {
    if (typeof value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }
}

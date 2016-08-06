import {PathElement} from ".././ot/Path";
import {BooleanSetOperation} from ".././ot/ops/BooleanSetOperation";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {OperationType} from ".././ot/ops/OperationType";
import {BooleanValue} from ".././dataValue";
import {ConvergenceValue, ModelValueEvent} from "./ConvergenceValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValueType} from "./ConvergenceValueType";


export default class ConvergenceBoolean extends ConvergenceValue<boolean> {

  static Events: any = {
    VALUE: "value",
    DETACHED: ConvergenceValue.Events.DETACHED,
    MODEL_CHANGED: ConvergenceValue.Events.MODEL_CHANGED
  };

  private _data: boolean;

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(data: BooleanValue,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Boolean, data.id, parent, fieldInParent, model);
    this._data = data.value;
  }


  //
  // private and protected methods
  //

  protected _getValue(): boolean {
    return this._data;
  }

  // Handlers for incoming operations

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === OperationType.BOOLEAN_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: BooleanSetOperation = <BooleanSetOperation> operationEvent.operation;
    var value: boolean = operation.value;

    this._validateSet(value);
    this._data = value;

    var event: BooleanSetValueEvent = {
      src: this,
      name: ConvergenceBoolean.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
    this._bubbleModelChangedEvent(event);
  }

  private _validateSet(value: boolean): void {
    if (typeof value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }
}

export interface BooleanSetValueEvent extends ModelValueEvent {
  src: ConvergenceBoolean;
  value:  boolean;
}

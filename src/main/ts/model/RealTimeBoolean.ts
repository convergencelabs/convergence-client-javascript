import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import {BooleanSetOperation} from "./ot/ops/BooleanSetOperation";
import {ModelOperationEvent} from "./ModelOperationEvent";
import {RealTimeValueType} from "./RealTimeValueType";
import {ModelChangeEvent} from "./events";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {OperationType} from "./ot/ops/OperationType";
import {BooleanValue} from "./dataValue";


export default class RealTimeBoolean extends RealTimeValue<boolean> {

  static Events: any = {
    VALUE: "VALUE",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _data: boolean;

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(data: BooleanValue,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Boolean, data.id, parent, fieldInParent, callbacks, model);
    this._data = data.value;
  }


  //
  // private and protected methods
  //

  protected _setValue(value: boolean): void {
    this._validateSet(value);

    var operation: BooleanSetOperation = new BooleanSetOperation(this.id(), false, value);
    this._data = value;
    this._sendOperation(operation);
  }

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
      name: RealTimeBoolean.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.userId,
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

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}

export interface BooleanSetValueEvent extends ModelChangeEvent {
  src: RealTimeBoolean;
  value:  boolean;
}

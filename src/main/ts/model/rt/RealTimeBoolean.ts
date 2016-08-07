import {RealTimeValue} from "./RealTimeValue";
import {ObservableBoolean} from "../observable/ObservableBoolean";
import {BooleanSetOperation} from "../ot/ops/BooleanSetOperation";
import {ModelValueType} from "../ModelValueType";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {PathElement} from "../ot/Path";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {BooleanValue} from "../dataValue";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ValueChangedEvent} from "../observable/ObservableValue";

export default class RealTimeBoolean extends RealTimeValue<boolean> implements ObservableBoolean {

  static Events: any = {
    VALUE: "value",
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
    super(ModelValueType.Boolean, data.id, parent, fieldInParent, callbacks, model);
    this._data = data.value;
  }


  //
  // private and protected methods
  //

  protected _setData(value: boolean): void {
    this._validateSet(value);

    var operation: BooleanSetOperation = new BooleanSetOperation(this.id(), false, value);
    this._data = value;
    this._sendOperation(operation);
  }

  protected _getData(): boolean {
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

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}

export interface BooleanSetValueEvent extends ValueChangedEvent {
  src: RealTimeBoolean;
  value:  boolean;
}

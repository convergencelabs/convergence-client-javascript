import {ModelNode} from "./ModelNode";
import {DateValue, DataValueType} from "../dataValue";
import {ModelElementType} from "../ModelElementType";
import {Model} from "./Model";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {DateNodeSetValueEvent} from "./events";
import {DateSet} from "../ot/ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export class DateNode extends ModelNode<Date> {

  public static Events: any = {
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: Date;

  /**
   * Constructs a new RealTimeDate.
   */
  constructor(data: DateValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelElementType.DATE, data.id, path, model, sessionId, username);
    this._data = data.value;
  }

  public dataValue(): DateValue {
    return {
      id: this.id(),
      type: DataValueType.DATE,
      value: this.data()
    } as DateValue;
  }

  public toJson(): any {
    return {
      $convergenceType: "date",
      value: this._data.toISOString()
    };
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.DATE_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  //
  // private and protected methods
  //

  protected _setData(value: Date): void {
    this._applySetValue(value, true, this.sessionId, this.username);
  }

  protected _getData(): Date {
    return this._data;
  }

  private _applySetValue(value: Date, local: boolean, sessionId: string, username: string): void {
    this._validateSet(value);
    this._data = value;

    const event: DateNodeSetValueEvent = new DateNodeSetValueEvent(this, local, value, sessionId, username);

    this._emitValueEvent(event);
  }

  // Handlers for incoming operations

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: DateSet = operationEvent.operation as DateSet;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateSet(value: Date): void {
    if (!(value instanceof Date)) {
      throw new Error("Value must be a Date");
    }
  }
}

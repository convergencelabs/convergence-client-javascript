import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path} from "../ot/Path";
import {ModelNode} from "./ModelNode";
import {DataValueFactory} from "../DataValueFactory";
import {ObjectNode} from "./ObjectNode";
import {ObjectValue} from "../dataValue";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export class Model extends ConvergenceEventEmitter<ConvergenceEvent> {

  static Events: any = {
    DELETED: "deleted",
    MODIFIED: "modified"
  };

  private _data: ObjectNode;
  private _idToValue: Map<string, ModelNode<any>>;

  private _vidCounter: number;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(private sessionId: string,
              private username: string,
              private valueIdPrefix: string,
              data: ObjectValue) {
    super();

    this._idToValue = new Map<string, ModelNode<any>>();
    this._vidCounter = 0;

    var dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return this.valueIdPrefix + this._vidCounter++;
  });

    this._data = new ObjectNode(data, () => {
      return [];
    }, this, sessionId, username, dataValueFactory);
  }

  root(): ObjectNode {
    return this._data;
  }

  valueAt(path: any): ModelNode<any> {
    var pathArgs: Path = Array.isArray(path) ? path : arguments;
    return this._data._valueAt(pathArgs);
  }

  //
  // Private API
  //

  _getRegisteredValue(id: string): ModelNode<any> {
    return this._idToValue.get(id);
  }

  _registerValue(value: ModelNode<any>): void {
    this._idToValue.set(value.id(), value);
  }

  _unregisterValue(value: ModelNode<any>): void {
    this._idToValue.delete(value.id());
  }

  handleModelOperationEvent(modelEvent: ModelOperationEvent): void {
    var child: ModelNode<any> = this._idToValue.get(modelEvent.operation.id);
    if (child) {
      child._handleModelOperationEvent(modelEvent);
    }
  }
}

Object.freeze(Model.Events);


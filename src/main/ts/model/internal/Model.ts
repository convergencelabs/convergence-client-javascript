import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path, PathElement} from "../Path";
import {ModelNode} from "./ModelNode";
import {DataValueFactory} from "../DataValueFactory";
import {ObjectNode} from "./ObjectNode";
import {ObjectValue} from "../dataValue";
import {IConvergenceEvent, ConvergenceEventEmitter} from "../../util/";
import {ConvergenceSession} from "../../ConvergenceSession";

const VALUE_SEPARATOR: string = ":";

/**
 * @hidden
 * @internal
 */
export class Model extends ConvergenceEventEmitter<IConvergenceEvent> {

  public static Events: any = {
    DELETED: "deleted",
    MODIFIED: "modified"
  };

  private readonly _data: ObjectNode;
  private _idToValue: Map<string, ModelNode<any>>;

  private _vidCounter: number;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(private session: ConvergenceSession,
              private valueIdPrefix: string,
              data: ObjectValue) {
    super();

    this._idToValue = new Map<string, ModelNode<any>>();
    this._vidCounter = 0;

    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return this.valueIdPrefix + VALUE_SEPARATOR + this._vidCounter++;
    });

    this._data = new ObjectNode(data, () => {
      return [];
    }, this, session, dataValueFactory);
  }

  public root(): ObjectNode {
    return this._data;
  }

  public valueAt(path: Path): ModelNode<any>;
  public valueAt(...elements: PathElement[]): ModelNode<any>;
  public valueAt(...path: any[]): ModelNode<any> {
    return this._data.valueAt(...path);
  }

  //
  // Private API
  //

  public _getRegisteredValue(id: string): ModelNode<any> {
    return this._idToValue.get(id);
  }

  public _registerValue(value: ModelNode<any>): void {
    this._idToValue.set(value.id(), value);
  }

  public _unregisterValue(value: ModelNode<any>): void {
    this._idToValue.delete(value.id());
  }

  public handleModelOperationEvent(modelEvent: ModelOperationEvent): void {
    const child: ModelNode<any> = this._idToValue.get(modelEvent.operation.id);
    if (child) {
      child._handleModelOperationEvent(modelEvent);
    }
  }
}

Object.freeze(Model.Events);

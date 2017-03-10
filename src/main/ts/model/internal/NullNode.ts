import {ModelNode} from "./ModelNode";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Model} from "./Model";
import {Path} from "../Path";
import {NullValue, DataValueType} from "../dataValue";

export class NullNode extends ModelNode<void> {

  public static Events: any = {
    DETACHED: ModelNode.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(id: string,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelElementType.NULL, id, path, model, sessionId, username);
  }

  public dataValue(): NullValue {
    return <NullValue> {
      id: this.id(),
      type: DataValueType.NULL,
      value: this.data()
    };
  }

  public toJson(): any {
    return null;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Null values do not process operations");
  }

  protected _getData(): any {
    return null;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Null type.");
  }
}

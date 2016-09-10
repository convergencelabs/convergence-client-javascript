import {ModelNode} from "./ModelNode";
import {ModelValueType} from "../ModelValueType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Model} from "./Model";
import {Path} from "../ot/Path";
import {NullValue} from "../dataValue";

export class NullNode extends ModelNode<void> {

  static Events: any = {
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
    super(ModelValueType.Null, id, path, model, sessionId, username);
  }

  dataValue(): NullValue {
    return <NullValue> {
      id: this.id(),
      type: "null",
      value: this.data()
    };
  }

  protected _getData(): any {
    return null;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Null type.");
  }

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Null values do not process operations");
  }
}

import {ModelNode} from "./ModelNode";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path} from "../ot/Path";
import {DataValue} from "../dataValue";

export class UndefinedNode extends ModelNode<void> {

  static Events: any = {
    DETACHED: ModelNode.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(id: string,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelElementType.Undefined, id, path, model, sessionId, username);
  }

  dataValue(): DataValue {
    return undefined;
  }

  protected _getData(): void {
    return undefined;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");

  }
}

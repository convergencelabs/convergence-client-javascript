import {ModelNode} from "./ModelNode";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path} from "../ot/Path";
import {DataValue} from "../dataValue";

export class UndefinedNode extends ModelNode<void> {

  public static Events: any = {
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

  public dataValue(): DataValue {
    return undefined;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");
  }

  protected _getData(): void {
    return undefined;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }
}

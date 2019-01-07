import {ModelNode} from "./ModelNode";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path} from "../Path";
import {DataValue} from "../dataValue";
import {ConvergenceSession} from "../../ConvergenceSession";

/**
 * @hidden
 * @internal
 */
export class UndefinedNode extends ModelNode<void> {

  public static Events: any = {
    DETACHED: ModelNode.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(id: string,
              path: () => Path,
              session: ConvergenceSession) {
    super(ModelElementType.UNDEFINED, id, path, undefined, session);
  }

  public dataValue(): DataValue {
    return undefined;
  }

  public toJson(): any {
    return undefined;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");
  }

  protected _getData(): void {
    return undefined;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the delta on a Undefined type.");
  }
}

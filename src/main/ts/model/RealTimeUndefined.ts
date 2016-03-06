import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "./ot/Path";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {IncomingReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";

export default class RealTimeUndefined extends RealTimeValue<void> {

  static Events: any = {
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Undefined, parent, fieldInParent, callbacks, model);
  }

  protected _getValue(): void {
    return undefined;
  }

  protected _setValue(any: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      throw new Error("Undefined values do not process operations");
    } else {
      throw new Error("Invalid path: undefined values do not have children");
    }
  }

  _handleRemoteReferenceEvent(relativePath: Path, event: IncomingReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }
}

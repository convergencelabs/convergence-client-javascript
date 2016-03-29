import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";

export default class RealTimeUndefined extends RealTimeValue<void> {

  static Events: any = {
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(id: string,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Undefined, id, parent, fieldInParent, callbacks, model);
  }

  protected _getValue(): void {
    return undefined;
  }

  protected _setValue(any: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }
}

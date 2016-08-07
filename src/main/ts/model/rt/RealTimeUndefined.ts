import {RealTimeValue} from "./RealTimeValue";
import {ObservableUndefined} from "../observable/ObservableUndefined";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {ModelValueType} from "../ModelValueType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";

export default class RealTimeUndefined extends RealTimeValue<void> implements ObservableUndefined {

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
    super(ModelValueType.Undefined, id, parent, fieldInParent, callbacks, model);
  }

  protected _getData(): void {
    return undefined;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }
}

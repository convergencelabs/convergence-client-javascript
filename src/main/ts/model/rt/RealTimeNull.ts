import {RealTimeValue} from "./RealTimeValue";
import {ObservableNull} from "../observable/ObservableNull";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {ModelValueType} from "../ModelValueType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";

export default class RealTimeNull extends RealTimeValue<any> implements ObservableNull {

  static Events: any = {
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(id: string,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(ModelValueType.Null, id, parent, fieldInParent, callbacks, model);
  }

  protected _getData(): any {
    return null;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Null type.");
  }

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Null values do not process operations");
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Null values do not process references");
  }
}

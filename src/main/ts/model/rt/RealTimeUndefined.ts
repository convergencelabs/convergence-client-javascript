import {RealTimeValue} from "./RealTimeValue";
import {UndefinedNode} from "../internal/UndefinedNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";

export class RealTimeUndefined extends RealTimeValue<void> {

  static Events: any = {
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(_delegate: UndefinedNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory) {
    super(_delegate, _callbacks, _wrapperFactory);
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }
}

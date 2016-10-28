import {RealTimeElement} from "./RealTimeElement";
import {NullNode} from "../internal/NullNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel} from "./RealTimeModel";

export class RealTimeNull extends RealTimeElement<any> {

  static Events: any = {
    DETACHED: RealTimeElement.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(_delegate: NullNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Null values do not process references");
  }
}

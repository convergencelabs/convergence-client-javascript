import {RealTimeElement} from "./RealTimeElement";
import {NullNode} from "../internal/NullNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel} from "./RealTimeModel";
import {ObservableNull, ObservableNullEvents, ObservableNullEventConstants} from "../observable/ObservableNull";

export interface RealTimeNullEvents extends ObservableNullEvents {
}

export class RealTimeNull extends RealTimeElement<void> implements ObservableNull {

  public static readonly Events: RealTimeNullEvents = ObservableNullEventConstants;

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(_delegate: NullNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Null values do not process references");
  }
}

import {RealTimeElement} from "./RealTimeElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel} from "./RealTimeModel";
import {
  ObservableUndefined,
  ObservableUndefinedEvents,
  ObservableUndefinedEventConstants} from "../observable/ObservableUndefined";

export interface RealTimeUndefinedEvents extends ObservableUndefinedEvents {
}

export class RealTimeUndefined extends RealTimeElement<void> implements ObservableUndefined {

  public static readonly Events: RealTimeUndefinedEvents = ObservableUndefinedEventConstants;

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(_delegate: UndefinedNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }
}

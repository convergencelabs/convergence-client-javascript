import {RealTimeElement} from "./RealTimeElement";
import {DateNode} from "../internal/DateNode";
import {DateSetOperation} from "../ot/ops/DateSetOperation";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ModelNodeEvent, DateNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeDateEvents extends ObservableDateEvents {
}

export class RealTimeDate extends RealTimeElement<Date> implements ObservableDate {

  public static readonly Events: RealTimeDateEvents = ObservableDateEventConstants;

  /**
   * Constructs a new RealTimeDate.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: DateNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof DateNodeSetValueEvent) {
          this._sendOperation(new DateSetOperation(this.id(), false, event.value));
        }
      }
    });
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Date values do not process references");
  }
}

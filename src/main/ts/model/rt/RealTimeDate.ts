import {RealTimeElement} from "./RealTimeElement";
import {DateNode} from "../internal/DateNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {DateSetOperation} from "../ot/ops/DateSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {DateNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants} from "../observable/ObservableDate";

export interface RealTimeDateEvents extends ObservableDateEvents {}

export class RealTimeDate extends RealTimeElement<Date> implements ObservableDate {

  public static readonly Events: RealTimeDateEvents = ObservableDateEventConstants;

  /**
   * Constructs a new RealTimeDate.
   */
  constructor(_delegate: DateNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof DateNodeSetValueEvent) {
          this._sendOperation(new DateSetOperation(this.id(), false, event.value));
        }
      }
    });
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Date values do not process references");
  }
}

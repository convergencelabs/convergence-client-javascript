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
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;

export interface RealTimeDateEvents extends ObservableDateEvents {
}

export class RealTimeDate extends RealTimeElement<Date> implements ObservableDate {

  public static readonly Events: RealTimeDateEvents = ObservableDateEventConstants;

  /**
   * Constructs a new RealTimeDate.
   *
   * @hidden
   * @private
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

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: IConvergenceMessage): void {
    throw new Error("Date values do not process references");
  }
}

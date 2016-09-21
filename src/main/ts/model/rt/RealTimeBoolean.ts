import {RealTimeValue} from "./RealTimeValue";
import {BooleanNode} from "../internal/BooleanNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {BooleanSetOperation} from "../ot/ops/BooleanSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {BooleanNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {EventConverter} from "./EventConverter";

export class RealTimeBoolean extends RealTimeValue<boolean> {

  static Events: any = {
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(_delegate: BooleanNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory) {
    super(_delegate, _callbacks, _wrapperFactory);


    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof BooleanNodeSetValueEvent) {
          this._sendOperation(new BooleanSetOperation(this.id(), false, event.value));
        }
      } else {
        let convertedEvent: ConvergenceEvent = EventConverter.convertEvent(event, this._wrapperFactory);
        this.emitEvent(convertedEvent);
      }
    });
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}

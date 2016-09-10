import {RealTimeValue} from "./RealTimeValue";
import {BooleanNode} from "../internal/BooleanNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ValueChangedEvent} from "../observable/ObservableValue";
import {BooleanSetOperation} from "../ot/ops/BooleanSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {BooleanNodeSetValueEvent} from "../internal/events";

export class RealTimeBoolean extends RealTimeValue<boolean> {

  static Events: any = {
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(_delegate: BooleanNode, _callbacks: ModelEventCallbacks) {
    super(_delegate, _callbacks);

    this._delegate.on(BooleanNode.Events.VALUE, (event: BooleanNodeSetValueEvent) => {
      if (event.local) {
        var operation: BooleanSetOperation = new BooleanSetOperation(this.id(), false, event.value);
        this._sendOperation(operation);
      } else {
        this.emitEvent(<BooleanSetValueEvent> {
          src: this,
          name: RealTimeBoolean.Events.VALUE,
          sessionId: event.sessionId,
          username: event.username,
          value: event.value
        });
      }
    });
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}

export interface BooleanSetValueEvent extends ValueChangedEvent {
  src: RealTimeBoolean;
  value:  boolean;
}

import {RealTimeValue} from "./RealTimeValue";
import {NumberNode} from "../internal/NumberNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ValueChangedEvent} from "../observable/ObservableValue";
import {NumberSetOperation} from "../ot/ops/NumberSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {NumberNodeSetValueEvent} from "../internal/events";
import {NumberNodeAddEvent} from "../internal/events";
import {NumberAddOperation} from "../ot/ops/NumberAddOperation";

export class RealTimeNumber extends RealTimeValue<number>  {

  static Events: any = {
    ADD: "add",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(protected _delegate: NumberNode,
              protected _callbacks: ModelEventCallbacks) {
    super(_delegate, _callbacks);

    this._delegate.on(NumberNode.Events.VALUE, (event: NumberNodeSetValueEvent) => {
      if (event.local) {
        var operation: NumberSetOperation = new NumberSetOperation(this.id(), false, event.value);
        this._sendOperation(operation);
      } else {
        this.emitEvent(<NumberSetValueEvent> {
          src: this,
          name: RealTimeNumber.Events.VALUE,
          sessionId: event.sessionId,
          username: event.username,
          value: event.value
        });
      }
    });

    this._delegate.on(NumberNode.Events.ADD, (event: NumberNodeAddEvent) => {
      if (event.local) {
        var operation: NumberAddOperation = new NumberAddOperation(this.id(), false, event.value);
        this._sendOperation(operation);
      } else {
        this.emitEvent(<NumberAddEvent> {
          src: this,
          name: RealTimeNumber.Events.ADD,
          sessionId: event.sessionId,
          username: event.username,
          value: event.value
        });
      }
    });
  }

  add(value: number): void {
    this._delegate.add(value);
  }

  subtract(value: number): void {
    this._delegate.subtract(value);
  }

  increment(): void {
    this._delegate.increment();
  }

  decrement(): void {
    this._delegate.decrement();
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Number values do not process references");
  }
}

export interface NumberSetValueEvent extends ValueChangedEvent {
  src: RealTimeNumber;
  value:  number;
}

export interface NumberAddEvent extends ValueChangedEvent {
  src: RealTimeNumber;
  value:  number;
}

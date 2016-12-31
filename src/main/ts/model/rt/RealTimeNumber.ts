import {RealTimeElement} from "./RealTimeElement";
import {NumberNode} from "../internal/NumberNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {NumberSetOperation} from "../ot/ops/NumberSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {NumberNodeSetValueEvent} from "../internal/events";
import {NumberNodeDeltaEvent} from "../internal/events";
import {NumberAddOperation} from "../ot/ops/NumberAddOperation";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";
import {ObservableNumber} from "../element/ObservableNumber";

export class RealTimeNumber extends RealTimeElement<number> implements ObservableNumber {

  public static Events: any = {
    DELTA: "delta",
    VALUE: "value",
    DETACHED: RealTimeElement.Events.DETACHED,
    MODEL_CHANGED: RealTimeElement.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(protected _delegate: NumberNode,
              protected _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof NumberNodeSetValueEvent) {
          this._sendOperation(new NumberSetOperation(this.id(), false, event.value));
        } else if (event instanceof NumberNodeDeltaEvent) {
          this._sendOperation(new NumberAddOperation(this.id(), false, event.value));
        }
      }
    });
  }

  public add(value: number): void {
    this._delegate.add(value);
  }

  public subtract(value: number): void {
    this._delegate.subtract(value);
  }

  public increment(): void {
    this._delegate.increment();
  }

  public decrement(): void {
    this._delegate.decrement();
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Number values do not process references");
  }
}

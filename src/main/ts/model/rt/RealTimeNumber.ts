import {RealTimeElement} from "./RealTimeElement";
import {NumberNode} from "../internal/NumberNode";
import {NumberSetOperation} from "../ot/ops/NumberSetOperation";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ModelNodeEvent, NumberNodeSetValueEvent, NumberNodeDeltaEvent} from "../internal/events";
import {NumberDeltaOperation} from "../ot/ops/NumberDeltaOperation";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNumber, ObservableNumberEvents, ObservableNumberEventConstants} from "../observable/ObservableNumber";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeNumberEvents extends ObservableNumberEvents {
}

export class RealTimeNumber extends RealTimeElement<number> implements ObservableNumber {

  public static readonly Events: RealTimeNumberEvents = ObservableNumberEventConstants;

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(delegate: NumberNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof NumberNodeSetValueEvent) {
          this._sendOperation(new NumberSetOperation(this.id(), false, event.value));
        } else if (event instanceof NumberNodeDeltaEvent) {
          this._sendOperation(new NumberDeltaOperation(this.id(), false, event.value));
        }
      }
    });
  }

  public add(value: number): void {
    this._assertWritable();
    (this._delegate as NumberNode).add(value);
  }

  public subtract(value: number): void {
    this._assertWritable();
    (this._delegate as NumberNode).subtract(value);
  }

  public increment(): void {
    this._assertWritable();
    (this._delegate as NumberNode).increment();
  }

  public decrement(): void {
    this._assertWritable();
    (this._delegate as NumberNode).decrement();
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Number values do not process references");
  }
}

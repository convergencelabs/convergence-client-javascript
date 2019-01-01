import {RealTimeElement} from "./RealTimeElement";
import {NumberNode} from "../internal/NumberNode";
import {NumberSetOperation} from "../ot/ops/NumberSetOperation";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ModelNodeEvent, NumberNodeSetValueEvent, NumberNodeDeltaEvent} from "../internal/events";
import {NumberAddOperation} from "../ot/ops/NumberAddOperation";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNumber, ObservableNumberEvents, ObservableNumberEventConstants} from "../observable/ObservableNumber";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;

export interface RealTimeNumberEvents extends ObservableNumberEvents {
}

export class RealTimeNumber extends RealTimeElement<number> implements ObservableNumber {

  public static readonly Events: RealTimeNumberEvents = ObservableNumberEventConstants;

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
    this._assertWritable();
    this._delegate.add(value);
  }

  public subtract(value: number): void {
    this._assertWritable();
    this._delegate.subtract(value);
  }

  public increment(): void {
    this._assertWritable();
    this._delegate.increment();
  }

  public decrement(): void {
    this._assertWritable();
    this._delegate.decrement();
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: IConvergenceMessage): void {
    throw new Error("Number values do not process references");
  }
}

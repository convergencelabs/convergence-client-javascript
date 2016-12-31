import {Path} from "../ot/Path";
import {ModelNode} from "../internal/ModelNode";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableElement} from "../observable/ObservableElement";
import {ModelEventConverter} from "../ModelEventConverter";

export abstract class HistoricalElement<T>
  extends ConvergenceEventEmitter<ConvergenceEvent>
  implements ObservableElement<T> {

  constructor(protected _delegate: ModelNode<T>, protected _wrapperFactory: HistoricalWrapperFactory) {
    super();

    this._delegate.events().subscribe((event: ConvergenceEvent) => {
      let convertedEvent: ConvergenceEvent = ModelEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  public id(): string {
    return this._delegate.id();
  }

  public type(): string {
    return this._delegate.type();
  }

  public path(): Path {
    return  this._delegate.path();
  }

  public isDetached(): boolean {
    return this._delegate.isDetached();
  }

  public value(): T {
    return this._delegate.data();
  }
}

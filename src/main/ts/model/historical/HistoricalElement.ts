import {Path} from "../Path";
import {ModelNode} from "../internal/ModelNode";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelEventConverter} from "../ModelEventConverter";
import {
  ObservableElement,
  ObservableElementEvents,
  ObservableElementEventConstants
} from "../observable/ObservableElement";

export interface HistoricalElementEvents extends ObservableElementEvents {
}

export abstract class HistoricalElement<T>
extends ConvergenceEventEmitter<ConvergenceEvent> implements ObservableElement<T> {

  public static readonly Events: HistoricalElementEvents = ObservableElementEventConstants;

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
    return this._delegate.path();
  }

  public isDetached(): boolean {
    return this._delegate.isDetached();
  }

  public value(): T {
    return this._delegate.data();
  }
}

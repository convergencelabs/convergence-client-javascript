import {ModelElementType} from "../ModelElementType";
import {Path} from "../ot/Path";
import {ModelNode} from "../internal/ModelNode";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {HistoricalEventConverter} from "./HistoricalEventConverter";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export abstract class HistoricalValue<T> extends ConvergenceEventEmitter<ConvergenceEvent> {

  constructor(protected _delegate: ModelNode<T>, protected _wrapperFactory: HistoricalWrapperFactory) {
    super();

    this._delegate.events().subscribe((event: ConvergenceEvent) => {
      let convertedEvent: ConvergenceEvent = HistoricalEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  id(): string {
    return this._delegate.id();
  }

  type(): ModelElementType {
    return this._delegate.type();
  }

  path(): Path {
    return  this._delegate.path();
  }

  isDetached(): boolean {
    return this._delegate.isDetached();
  }

  data(): T {
    return this._delegate.data();
  }
}

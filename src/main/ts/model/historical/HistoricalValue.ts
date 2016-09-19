import {ModelValueType} from "../ModelValueType";
import {Path} from "../ot/Path";
import {ModelNode} from "../internal/ModelNode";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelNodeEvent} from "../internal/events";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {HistoricalEventConverter} from "./HistoricalEventConverter";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export abstract class HistoricalValue<T> extends ConvergenceEventEmitter {

  constructor(protected _delegate: ModelNode<T>, protected _wrapperFactory: HistoricalWrapperFactory) {
    super();

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      let convertedEvent: ConvergenceEvent = HistoricalEventConverter.convertEvent(event, this._wrapperFactory);
      this.emitEvent(convertedEvent);
    });
  }

  id(): string {
    return this._delegate.id();
  }

  type(): ModelValueType {
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

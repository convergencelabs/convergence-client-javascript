import {ModelValueType} from "../ModelValueType";
import {Path} from "../ot/Path";
import {ModelNode} from "../internal/ModelNode";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export abstract class HistoricalValue<T> extends ConvergenceEventEmitter {

  constructor(protected _delegate: ModelNode<T>) {
    super();
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

import {HistoricalValue} from "./HistoricalValue";
import {HistoricalContainerValue} from "./HistoricalContainerValue";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalArray extends HistoricalValue<any[]> implements HistoricalContainerValue<any[]> {

  constructor(protected _delegate: ArrayNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  get(index: number): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }

  length(): number {
    return this._delegate.length();
  }

  forEach(callback: (value: HistoricalValue<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  valueAt(pathArgs: any): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }
}

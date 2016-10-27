import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalArray extends HistoricalElement<any[]> implements HistoricalContainerElement<any[]> {

  constructor(protected _delegate: ArrayNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  get(index: number): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }

  length(): number {
    return this._delegate.length();
  }

  forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  valueAt(pathArgs: any): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }
}

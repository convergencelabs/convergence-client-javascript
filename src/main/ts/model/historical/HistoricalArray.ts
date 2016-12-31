import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableArray} from "../observable/ObservableArray";

export class HistoricalArray
  extends HistoricalElement<any[]>
  implements ObservableArray, HistoricalContainerElement<any[]> {

  constructor(protected _delegate: ArrayNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  public get(index: number): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }

  public length(): number {
    return this._delegate.length();
  }

  public forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public elementAt(pathArgs: any): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }
}

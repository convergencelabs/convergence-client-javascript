import {HistoricalElement} from "./HistoricalElement";
import {ObjectNode} from "../internal/ObjectNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {HistoricalContainerElement} from "./HistoricalContainerElement";

export class HistoricalObject extends HistoricalElement<Map<string, any>> implements HistoricalContainerElement<Map<string, any>> {

  constructor(protected _delegate: ObjectNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  get(key: string): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(key));
  }

  keys(): string[] {
    return this._delegate.keys();
  }

  hasKey(key: string): boolean {
    return this._delegate.hasKey(key);
  }

  forEach(callback: (model: HistoricalElement<any>, key?: string) => void): void {
    this._delegate.forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  elementAt(pathArgs: any): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }
}

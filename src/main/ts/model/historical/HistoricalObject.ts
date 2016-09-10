import {HistoricalValue} from "./HistoricalValue";
import {ObjectNode} from "../internal/ObjectNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalObject extends HistoricalValue<any> {

  constructor(protected _delegate: ObjectNode, private _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate);
  }

  get(key: string): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._delegate.get(key));
  }

  keys(): string[] {
    return this._delegate.keys();
  }

  hasKey(key: string): boolean {
    return this._delegate.hasKey(key);
  }

  forEach(callback: (model: HistoricalValue<any>, key?: string) => void): void {
    this._delegate.forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  valueAt(pathArgs: any): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }
}

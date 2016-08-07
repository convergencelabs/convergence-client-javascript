import {ObservableValue} from "../observable/ObservableValue";
import {HistoricalValueConverter} from "./HistoricalValueConverter";
import {RealTimeArray} from "../rt/RealTimeArray";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableArray} from "../observable/ObservableArray";

export class HistoricalArray extends HistoricalValue<any> implements ObservableArray {

  private _array: RealTimeArray;

  constructor(value: RealTimeArray) {
    super(value);
    this._array = value;
  }

  get(key: number): HistoricalValue<any> {
    return HistoricalValueConverter.wrapValue(this._array.get(key));
  }

  length(): number {
    return this._array.length();
  }

  forEach(callback: (value: ObservableValue<any>, index?: number) => void): void {
    this._array.forEach(callback);
  }

  valueAt(pathArgs: any): ObservableValue<any> {
    return HistoricalValueConverter.wrapValue(this._array.valueAt(pathArgs));
  }
}

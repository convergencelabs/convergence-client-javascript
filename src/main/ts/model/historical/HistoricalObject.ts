import {ObservableObject} from "../observable/ObservableObject";
import {ObservableValue} from "../observable/ObservableValue";
import {HistoricalValueConverter} from "./HistoricalValueConverter";
import {RealTimeObject} from "../rt/RealTimeObject";
import {HistoricalValue} from "./HistoricalValue";

export class HistoricalObject extends HistoricalValue<any> implements ObservableObject {

  private _object: RealTimeObject;

  constructor(value: RealTimeObject) {
    super(value);
    this._object = value;
  }

  get(key: string): ObservableValue<any> {
    return HistoricalValueConverter.wrapValue(this._object.get(key));
  }

  keys(): string[] {
    return this._object.keys();
  }

  hasKey(key: string): boolean {
    return this._object.hasKey(key);
  }

  forEach(callback: (value: ObservableValue<any>, key?: string) => void): void {
    this._object.forEach(callback);
  }

  valueAt(pathArgs: any): ObservableValue<any> {
    return HistoricalValueConverter.wrapValue(this._object.valueAt(pathArgs));
  }
}

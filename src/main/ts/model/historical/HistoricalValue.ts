import {ObservableValue} from "../observable/ObservableValue";
import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelValueType} from "../ModelValueType";
import {ObservableModel} from "../observable/ObservableModel";
import {Path} from "../ot/Path";

export abstract class HistoricalValue<T> implements ObservableValue<T> {

  protected _value: RealTimeValue<T>;

  constructor(value: RealTimeValue<T>) {
    this._value = value;
  }

  id(): string {
    return this._value.id();
  }

  type(): ModelValueType {
    return this._value.type();
  }

  path(): Path {
    return this._value.path();
  }

  model(): ObservableModel {
    return this._value.model();
  }

  isDetached(): boolean {
    return this._value.isDetached();
  }

  data(): T
  data(value: T): void
  data(value?: T): any {
    return this._value.data(value);
  }
}

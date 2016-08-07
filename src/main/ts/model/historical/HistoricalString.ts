import {RealTimeString} from "../rt/RealTimeString";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableString} from "../observable/ObservableString";

export class HistoricalString extends HistoricalValue<any> implements ObservableString {

  private _string: RealTimeString;

  constructor(value: RealTimeString) {
    super(value);
    this._string = value;
  }

  length(): number{
    return this._string.length();
  }
}

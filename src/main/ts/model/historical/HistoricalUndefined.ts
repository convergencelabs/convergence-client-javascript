import {RealTimeUndefined} from "../rt/RealTimeUndefined";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableUndefined} from "../observable/ObservableUndefined";

export class HistoricalUndefined extends HistoricalValue<any> implements ObservableUndefined {
  constructor(value: RealTimeUndefined) {
    super(value);
  }
}

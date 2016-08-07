import {RealTimeBoolean} from "../rt/RealTimeBoolean";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableBoolean} from "../observable/ObservableBoolean";

export class HistoricalBoolean extends HistoricalValue<any> implements ObservableBoolean {
  constructor(value: RealTimeBoolean) {
    super(value);
  }
}

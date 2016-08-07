import {RealTimeNumber} from "../rt/RealTimeNumber";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableNumber} from "../observable/ObservableNumber";

export class HistoricalNumber extends HistoricalValue<any> implements ObservableNumber {
  constructor(value: RealTimeNumber) {
    super(value);
  }
}

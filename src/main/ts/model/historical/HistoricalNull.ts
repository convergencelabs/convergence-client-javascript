import {RealTimeNull} from "../rt/RealTimeNull";
import {HistoricalValue} from "./HistoricalValue";
import {ObservableNull} from "../observable/ObservableNull";

export class HistoricalNull extends HistoricalValue<any> implements ObservableNull {
  constructor(value: RealTimeNull) {
    super(value);
  }
}

import {RealTimeValue} from "../rt/RealTimeValue";
import {HistoricalValue} from "./HistoricalValue";
import {ModelValueType} from "../ModelValueType";
import {HistoricalObject} from "./HistoricalObject";
import {RealTimeObject} from "../rt/RealTimeObject";
import {RealTimeArray} from "../rt/RealTimeArray";
import {HistoricalArray} from "./HistoricalArray";
import RealTimeBoolean from "../rt/RealTimeBoolean";
import {HistoricalBoolean} from "./HistoricalBoolean";
import RealTimeNumber from "../rt/RealTimeNumber";
import {HistoricalNumber} from "./HistoricalNumber";
import RealTimeNull from "../rt/RealTimeNull";
import RealTimeUndefined from "../rt/RealTimeUndefined";
import {HistoricalNull} from "./HistoricalNull";
import {HistoricalUndefined} from "./HistoricalUndefined";
import RealTimeString from "../rt/RealTimeString";
import {HistoricalString} from "./HistoricalString";

export class HistoricalValueConverter {
  static wrapValue(value: RealTimeValue<any>): HistoricalValue<any> {
    if (value === undefined) {
      return undefined;
    } else if (value.type() === ModelValueType.Object) {
      return new HistoricalObject(<RealTimeObject>value);
    } else if (value.type() === ModelValueType.Array) {
      return new HistoricalArray(<RealTimeArray>value);
    } else if (value.type() === ModelValueType.Boolean) {
      return new HistoricalBoolean(<RealTimeBoolean>value);
    } else if (value.type() === ModelValueType.Number) {
      return new HistoricalNumber(<RealTimeNumber>value);
    } else if (value.type() === ModelValueType.Null) {
      return new HistoricalNull(<RealTimeNull>value);
    } else if (value.type() === ModelValueType.Undefined) {
      return new HistoricalUndefined(<RealTimeUndefined>value);
    } else if (value.type() === ModelValueType.String) {
      return new HistoricalString(<RealTimeString>value);
    }
  }
}

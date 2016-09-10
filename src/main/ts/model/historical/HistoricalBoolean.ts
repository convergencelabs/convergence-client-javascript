import {HistoricalValue} from "./HistoricalValue";
import {BooleanNode} from "../internal/BooleanNode";

export class HistoricalBoolean extends HistoricalValue<any> {
  constructor(_delegate: BooleanNode) {
    super(_delegate);
  }
}

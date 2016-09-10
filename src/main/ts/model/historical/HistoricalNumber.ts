import {HistoricalValue} from "./HistoricalValue";
import {NumberNode} from "../internal/NumberNode";

export class HistoricalNumber extends HistoricalValue<any> {
  constructor(_delegate: NumberNode) {
    super(_delegate);
  }
}

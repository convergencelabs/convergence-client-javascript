import {HistoricalValue} from "./HistoricalValue";
import {UndefinedNode} from "../internal/UndefinedNode";

export class HistoricalUndefined extends HistoricalValue<any> {
  constructor(_delegate: UndefinedNode) {
    super(_delegate);
  }
}

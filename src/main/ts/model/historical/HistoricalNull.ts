import {HistoricalValue} from "./HistoricalValue";
import {NullNode} from "../internal/NullNode";

export class HistoricalNull extends HistoricalValue<any>  {
  constructor(_delegate: NullNode) {
    super(_delegate);
  }
}

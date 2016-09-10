import {HistoricalValue} from "./HistoricalValue";
import {StringNode} from "../internal/StringNode";

export class HistoricalString extends HistoricalValue<any> {


  constructor(protected _delegate: StringNode) {
    super(_delegate);
  }

  length(): number {
    return this._delegate.length();
  }
}

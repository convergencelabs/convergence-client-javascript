import {HistoricalValue} from "./HistoricalValue";
import {StringNode} from "../internal/StringNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalString extends HistoricalValue<any> {


  constructor(protected _delegate: StringNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  length(): number {
    return this._delegate.length();
  }
}

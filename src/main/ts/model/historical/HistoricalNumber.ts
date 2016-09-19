import {HistoricalValue} from "./HistoricalValue";
import {NumberNode} from "../internal/NumberNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalNumber extends HistoricalValue<any> {
  constructor(_delegate: NumberNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

import {HistoricalElement} from "./HistoricalElement";
import {NumberNode} from "../internal/NumberNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalNumber extends HistoricalElement<any> {
  constructor(_delegate: NumberNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

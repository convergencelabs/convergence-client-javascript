import {HistoricalElement} from "./HistoricalElement";
import {NumberNode} from "../internal/NumberNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableNumber} from "../observable/ObservableNumber";

export class HistoricalNumber extends HistoricalElement<number> implements ObservableNumber {
  constructor(_delegate: NumberNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

import {HistoricalElement} from "./HistoricalElement";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalBoolean extends HistoricalElement<any> {
  constructor(_delegate: BooleanNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

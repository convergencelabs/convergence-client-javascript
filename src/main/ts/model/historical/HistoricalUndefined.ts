import {HistoricalElement} from "./HistoricalElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalUndefined extends HistoricalElement<any> {
  constructor(_delegate: UndefinedNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

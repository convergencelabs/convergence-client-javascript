import {HistoricalElement} from "./HistoricalElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableUndefined} from "../observable/ObservableUndefined";

export class HistoricalUndefined extends HistoricalElement<void> implements ObservableUndefined {
  constructor(_delegate: UndefinedNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

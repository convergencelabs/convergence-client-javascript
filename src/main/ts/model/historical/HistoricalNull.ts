import {HistoricalElement} from "./HistoricalElement";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableNull} from "../element/ObservableNull";

export class HistoricalNull extends HistoricalElement<void> implements ObservableNull {
  constructor(_delegate: NullNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

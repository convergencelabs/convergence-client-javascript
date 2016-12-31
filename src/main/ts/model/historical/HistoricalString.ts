import {HistoricalElement} from "./HistoricalElement";
import {StringNode} from "../internal/StringNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableString} from "../observable/ObservableString";

export class HistoricalString extends HistoricalElement<string> implements ObservableString{

  constructor(protected _delegate: StringNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }

  public length(): number {
    return this._delegate.length();
  }
}

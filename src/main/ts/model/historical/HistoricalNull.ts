import {HistoricalElement} from "./HistoricalElement";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalNull extends HistoricalElement<any>  {
  constructor(_delegate: NullNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

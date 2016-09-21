import {HistoricalValue} from "./HistoricalValue";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalNull extends HistoricalValue<any>  {
  constructor(_delegate: NullNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

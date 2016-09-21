import {HistoricalValue} from "./HistoricalValue";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalBoolean extends HistoricalValue<any> {
  constructor(_delegate: BooleanNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

import {HistoricalValue} from "./HistoricalValue";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalUndefined extends HistoricalValue<any> {
  constructor(_delegate: UndefinedNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

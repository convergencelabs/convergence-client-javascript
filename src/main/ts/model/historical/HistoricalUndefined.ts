import {HistoricalElement} from "./HistoricalElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableUndefined,
  ObservableUndefinedEvents,
  ObservableUndefinedEventConstants
} from "../observable/ObservableUndefined";

export interface HistoricalUndefinedEvents extends ObservableUndefinedEvents {
}

export class HistoricalUndefined extends HistoricalElement<void> implements ObservableUndefined {

  public static readonly Events: HistoricalUndefinedEvents = ObservableUndefinedEventConstants;

  constructor(_delegate: UndefinedNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

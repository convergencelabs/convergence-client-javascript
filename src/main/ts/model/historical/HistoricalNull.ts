import {HistoricalElement} from "./HistoricalElement";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableNull,
  ObservableNullEvents,
  ObservableNullEventConstants
} from "../observable/ObservableNull";

export interface HistoricalNullEvents extends ObservableNullEvents {
}

export class HistoricalNull extends HistoricalElement<void> implements ObservableNull {
  public static readonly Events: HistoricalNullEvents = ObservableNullEventConstants;

  constructor(_delegate: NullNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}

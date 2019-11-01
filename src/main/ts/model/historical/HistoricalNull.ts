import {HistoricalElement} from "./HistoricalElement";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableNull,
  ObservableNullEvents,
  ObservableNullEventConstants
} from "../observable/ObservableNull";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module RealTimeData
 */
export interface HistoricalNullEvents extends ObservableNullEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeNull]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module RealTimeData
 */
export class HistoricalNull extends HistoricalElement<void> implements ObservableNull {
  public static readonly Events: HistoricalNullEvents = ObservableNullEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: NullNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}

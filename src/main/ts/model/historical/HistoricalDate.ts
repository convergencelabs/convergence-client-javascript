import {HistoricalElement} from "./HistoricalElement";
import {DateNode} from "../internal/DateNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module RealTimeData
 */
export interface HistoricalDateEvents extends ObservableDateEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeDate]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module RealTimeData
 */
export class HistoricalDate extends HistoricalElement<Date> implements ObservableDate {

  public static readonly Events: HistoricalDateEvents = ObservableDateEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: DateNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}

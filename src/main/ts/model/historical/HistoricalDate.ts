import {HistoricalElement} from "./HistoricalElement";
import {DateNode} from "../internal/DateNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";
import {HistoricalModel} from "./HistoricalModel";

export interface HistoricalDateEvents extends ObservableDateEvents {
}

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

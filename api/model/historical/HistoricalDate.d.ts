import {HistoricalElement} from "./HistoricalElement";

import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";

export interface HistoricalDateEvents extends ObservableDateEvents {
}

export class HistoricalDate extends HistoricalElement<Date> implements ObservableDate {

  public static readonly Events: HistoricalDateEvents ;

}

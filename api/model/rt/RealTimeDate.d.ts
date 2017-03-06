import {RealTimeElement} from "./RealTimeElement";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";

export interface RealTimeDateEvents extends ObservableDateEvents {
}

export declare class RealTimeDate extends RealTimeElement<Date> implements ObservableDate {

  public static readonly Events: RealTimeDateEvents;

}

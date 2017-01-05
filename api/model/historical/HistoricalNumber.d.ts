import {HistoricalElement} from "./HistoricalElement";
import {ObservableNumber, ObservableNumberEvents} from "../observable/ObservableNumber";

export interface HistoricalNumberEvents extends ObservableNumberEvents {
}

export declare class HistoricalNumber extends HistoricalElement<number> implements ObservableNumber {
  public static readonly Events: HistoricalNumberEvents;
}

import {HistoricalElement} from "./HistoricalElement";
import {ObservableNull, ObservableNullEvents} from "../observable/ObservableNull";

export interface HistoricalNullEvents extends ObservableNullEvents {
}

export declare class HistoricalNull extends HistoricalElement<void> implements ObservableNull {
  public static readonly Events: HistoricalNullEvents;
}

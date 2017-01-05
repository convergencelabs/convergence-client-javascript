import {HistoricalElement} from "./HistoricalElement";
import {ObservableString, ObservableStringEvents} from "../observable/ObservableString";

export interface HistoricalStringEvents extends ObservableStringEvents {
}

export declare class HistoricalString extends HistoricalElement<string> implements ObservableString {

  public static readonly Events: HistoricalStringEvents;

  public length(): number;
}

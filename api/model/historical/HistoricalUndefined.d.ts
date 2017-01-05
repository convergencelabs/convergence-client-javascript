import {HistoricalElement} from "./HistoricalElement";
import {ObservableUndefined, ObservableUndefinedEvents} from "../observable/ObservableUndefined";

export interface HistoricalUndefinedEvents extends ObservableUndefinedEvents {
}

export declare class HistoricalUndefined extends HistoricalElement<void> implements ObservableUndefined {

  public static readonly Events: HistoricalUndefinedEvents;

}

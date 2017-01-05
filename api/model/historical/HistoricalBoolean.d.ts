import {HistoricalElement} from "./HistoricalElement";
import {ObservableBoolean, ObservableBooleanEvents} from "../observable/ObservableBoolean";

export interface HistoricalBooleanEvents extends ObservableBooleanEvents {
}

export declare class HistoricalBoolean extends HistoricalElement<boolean> implements ObservableBoolean {
  public static readonly Events: HistoricalBooleanEvents;
}

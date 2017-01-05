import {RealTimeElement} from "./RealTimeElement";
import {ObservableBoolean, ObservableBooleanEvents} from "../observable/ObservableBoolean";

export interface RealTimeBooleanEvents extends ObservableBooleanEvents {
}

export declare class RealTimeBoolean extends RealTimeElement<boolean> implements ObservableBoolean {
  public static readonly Events: RealTimeBooleanEvents;
}

import {RealTimeElement} from "./RealTimeElement";
import {ObservableNull, ObservableNullEvents} from "../observable/ObservableNull";

export interface RealTimeNullEvents extends ObservableNullEvents {
}

export declare class RealTimeNull extends RealTimeElement<void> implements ObservableNull {
  public static readonly Events: RealTimeNullEvents;
}

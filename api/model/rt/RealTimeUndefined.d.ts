import {RealTimeElement} from "./RealTimeElement";
import {ObservableUndefined, ObservableUndefinedEvents} from "../observable/ObservableUndefined";

export interface RealTimeUndefinedEvents extends ObservableUndefinedEvents {
}

export declare class RealTimeUndefined extends RealTimeElement<void> implements ObservableUndefined {
  public static readonly Events: RealTimeUndefinedEvents;
}

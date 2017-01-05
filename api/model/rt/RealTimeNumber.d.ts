import {RealTimeElement} from "./RealTimeElement";
import {ObservableNumber, ObservableNumberEvents} from "../observable/ObservableNumber";

export interface RealTimeNumberEvents extends ObservableNumberEvents {
}

export declare class RealTimeNumber extends RealTimeElement<number> implements ObservableNumber {
  public static readonly Events: RealTimeNumberEvents;

  public add(num: number): void;

  public subtract(num: number): void;

  public increment(): void;

  public decrement(): void;
}

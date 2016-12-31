import {RealTimeElement} from "./RealTimeElement";
import {ObservableNull} from "../observable/ObservableNull";

export declare class RealTimeNumber extends RealTimeElement<number> implements ObservableNull {
  public static Events: any;

  public add(num: number): void;

  public subtract(num: number): void;

  public increment(): void;

  public decrement(): void;
}

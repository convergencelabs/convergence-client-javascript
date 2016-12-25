import {RealTimeElement} from "./RealTimeElement";

export declare class RealTimeNumber extends RealTimeElement<number> {
  public static Events: any;

  public add(num: number): void;

  public subtract(num: number): void;

  public increment(): void;

  public decrement(): void;
}

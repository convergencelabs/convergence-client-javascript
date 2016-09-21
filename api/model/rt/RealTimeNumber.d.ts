import {RealTimeValue} from "./RealTimeValue";

export declare class RealTimeNumber extends RealTimeValue<number> {
  static Events: any;

  add(value: number): void;

  subtract(value: number): void;

  increment(): void;

  decrement(): void;
}

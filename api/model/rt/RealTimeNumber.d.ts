import {RealTimeElement} from "./RealTimeElement";

export declare class RealTimeNumber extends RealTimeElement<number> {
  static Events: any;

  add(num: number): void;

  subtract(num: number): void;

  increment(): void;

  decrement(): void;
}

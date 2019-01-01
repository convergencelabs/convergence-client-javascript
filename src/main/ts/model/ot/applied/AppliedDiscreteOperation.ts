import {AppliedOperation} from "./AppliedOperation";
import {DiscreteChange} from "../ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class AppliedDiscreteOperation extends AppliedOperation implements DiscreteChange {
  protected constructor(type: string,
                        public readonly id: string,
                        public readonly noOp: boolean) {
    super(type);
  }
}

import {Operation} from "./Operation";
import {DiscreteChange} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class DiscreteOperation extends Operation implements DiscreteChange {
  protected constructor(type: string,
                        public readonly id: string,
                        public readonly noOp: boolean) {
    super(type);
  }
}

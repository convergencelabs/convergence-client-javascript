import {Operation} from "../ops/Operation";

/**
 * @hidden
 * @internal
 */
export class OperationPair {
  constructor(public serverOp: Operation, public clientOp: Operation) {
    Object.freeze(this);
  }
}

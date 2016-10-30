import {Operation} from "../ops/Operation";

export class OperationPair {
  constructor(public serverOp: Operation, public clientOp: Operation) {
    Object.freeze(this);
  }
}

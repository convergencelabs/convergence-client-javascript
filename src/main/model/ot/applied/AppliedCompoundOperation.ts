import {AppliedOperation} from "./AppliedOperation";
import {BatchChange} from "../ops/operationChanges";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedCompoundOperation extends AppliedOperation implements BatchChange {
  constructor(public readonly ops: AppliedDiscreteOperation[]) {
    super(OperationType.COMPOUND);
    Object.freeze(this);
  }

  public inverse(): AppliedCompoundOperation {
    return new AppliedCompoundOperation(this.ops.map((op) => {
      return op.inverse() as AppliedDiscreteOperation;
    }));
  }
}

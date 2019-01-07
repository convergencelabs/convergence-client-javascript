import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {NumberDelta} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedNumberDeltaOperation extends AppliedDiscreteOperation implements NumberDelta {

  constructor(id: string,
              noOp: boolean,
              public readonly delta: number) {
    super(OperationType.NUMBER_DELTA, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedNumberDeltaOperation {
    return new AppliedNumberDeltaOperation(this.id, this.noOp, -this.delta);
  }
}

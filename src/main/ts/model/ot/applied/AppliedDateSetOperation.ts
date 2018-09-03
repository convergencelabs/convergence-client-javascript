import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {DateSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedDateSetOperation extends AppliedDiscreteOperation implements DateSet {

  constructor(id: string, noOp: boolean, public value: Date, public oldValue: Date) {
    super(OperationType.DATE_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedDateSetOperation {
    return new AppliedDateSetOperation(this.id, this.noOp, this.oldValue,  this.value);
  }
}

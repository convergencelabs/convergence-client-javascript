import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {NumberAdd} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedNumberAddOperation extends AppliedDiscreteOperation implements NumberAdd {

  protected _value: number;

  constructor(id: string, noOp: boolean, public value: number) {
    super(OperationType.NUMBER_ADD, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedNumberAddOperation {
    return new AppliedNumberAddOperation(this.id, this.noOp, -this.value);
  }
}

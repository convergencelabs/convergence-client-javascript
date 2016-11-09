import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {OperationType} from "../ops/OperationType";
import {NumberSet} from "../ops/operationChanges";

export class AppliedNumberSetOperation extends AppliedDiscreteOperation implements NumberSet {

  constructor(id: string, noOp: boolean, public value: number, public oldValue: number) {
    super(OperationType.NUMBER_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedNumberSetOperation {
    return new AppliedNumberSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

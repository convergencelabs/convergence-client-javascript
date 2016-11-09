import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedStringSetOperation extends AppliedDiscreteOperation implements StringSet {

  constructor(id: string, noOp: boolean, public value: string, public oldValue: string) {
    super(OperationType.STRING_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedStringSetOperation {
    return new AppliedStringSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

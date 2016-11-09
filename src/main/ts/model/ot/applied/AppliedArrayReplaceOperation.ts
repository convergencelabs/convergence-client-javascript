import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArrayReplace} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedArrayReplaceOperation extends AppliedDiscreteOperation implements ArrayReplace {

  constructor(id: string, noOp: boolean, public index: number, public value: DataValue, public oldValue: DataValue) {
    super(OperationType.ARRAY_SET, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArrayReplaceOperation {
    return new AppliedArrayReplaceOperation(this.id, this.noOp, this.index, this.oldValue, this.value);
  }
}

import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArraySet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedArraySetOperation extends AppliedDiscreteOperation implements ArraySet {

  constructor(id: string, noOp: boolean, public value: DataValue[], public oldValue: DataValue[]) {
    super(OperationType.ARRAY_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArraySetOperation {
    return new AppliedArraySetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

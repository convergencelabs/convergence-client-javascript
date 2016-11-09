import {DataValue} from "../../dataValue";
import {AppliedArrayInsertOperation} from "./AppliedArrayInsertOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArrayRemove} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedArrayRemoveOperation extends AppliedDiscreteOperation implements ArrayRemove {

  constructor(id: string, noOp: boolean, public index: number, public oldValue: DataValue) {
    super(OperationType.ARRAY_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArrayInsertOperation {
    return new AppliedArrayInsertOperation(this.id, this.noOp, this.index, this.oldValue);
  }
}

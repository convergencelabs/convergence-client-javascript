import {AppliedStringRemoveOperation} from "./AppliedStringRemoveOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringInsert} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedStringInsertOperation extends AppliedDiscreteOperation implements StringInsert {

  constructor(id: string, noOp: boolean, public index: number, public value: string) {
    super(OperationType.STRING_INSERT, id, noOp);
    Object.freeze(this);
  }

  inverse(): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

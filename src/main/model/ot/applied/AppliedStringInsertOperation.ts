import {AppliedStringRemoveOperation} from "./AppliedStringRemoveOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringInsert} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedStringInsertOperation extends AppliedDiscreteOperation implements StringInsert {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: string) {
    super(OperationType.STRING_INSERT, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

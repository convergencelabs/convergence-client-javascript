import {AppliedStringInsertOperation} from "./AppliedStringInsertOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringRemove} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedStringRemoveOperation extends AppliedDiscreteOperation implements StringRemove {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: string) {
    super(OperationType.STRING_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedStringInsertOperation {
    return new AppliedStringInsertOperation(this.id, this.noOp, this.index, this.value);
  }
}

import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetOperation extends AppliedDiscreteOperation implements ObjectSet {

  constructor(id: string, noOp: boolean, public value: {[key: string]: DataValue},
              public oldValue: {[key: string]: DataValue}) {
    super(OperationType.OBJECT_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectSetOperation {
    return new AppliedObjectSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

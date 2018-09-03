import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectSetProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetPropertyOperation extends AppliedDiscreteOperation implements ObjectSetProperty {

  constructor(id: string, noOp: boolean, public prop: string, public value: DataValue, public oldValue: DataValue) {
    super(OperationType.OBJECT_SET, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectSetPropertyOperation {
    return new AppliedObjectSetPropertyOperation(this.id, this.noOp, this.prop, this.oldValue, this.value);
  }
}

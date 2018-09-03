import {DataValue} from "../../dataValue";
import {AppliedObjectAddPropertyOperation} from "./AppliedObjectAddPropertyOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectRemoveProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectRemovePropertyOperation extends AppliedDiscreteOperation implements ObjectRemoveProperty {

  protected _prop: string;

  constructor(id: string, noOp: boolean, public prop: string, public oldValue: DataValue) {
    super(OperationType.OBJECT_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectAddPropertyOperation {
    return new AppliedObjectAddPropertyOperation(this.id, this.noOp, this.prop, this.oldValue);
  }
}

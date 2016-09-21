import {DataValue} from "../../dataValue";
import {AppliedObjectRemovePropertyOperation} from "./AppliedObjectRemovePropertyOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectAddProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedObjectAddPropertyOperation extends AppliedDiscreteOperation implements ObjectAddProperty {

  constructor(id: string, noOp: boolean, public prop: string, public value: DataValue) {
    super(OperationType.OBJECT_ADD, id, noOp);
    Object.freeze(this);
  }

  inverse(): AppliedObjectRemovePropertyOperation {
    return new AppliedObjectRemovePropertyOperation(this.id, this.noOp, this.prop, this.value);
  }
}

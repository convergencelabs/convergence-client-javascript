import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {OperationType} from "./OperationType";

export default class ObjectRemovePropertyOperation extends DiscreteOperation {

  protected _prop: string;

  constructor(id: string, noOp: boolean, public prop: string) {
    super(OperationType.OBJECT_REMOVE, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop));
  }
}


import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class ObjectRemovePropertyOperation extends DiscreteOperation {

  protected _prop: string;

  constructor(path: Path, noOp: boolean, public prop: string) {
    super(OperationType.OBJECT_REMOVE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop));
  }
}


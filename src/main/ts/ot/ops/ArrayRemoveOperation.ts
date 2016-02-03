import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ArrayRemoveOperation extends DiscreteOperation {

  static TYPE: string = "ArrayRemove";

  constructor(path: Path, noOp: boolean, public index: number) {
    super(ArrayRemoveOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index));
  }
}


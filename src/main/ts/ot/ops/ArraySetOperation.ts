import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ArraySetOperation extends DiscreteOperation {

  static TYPE: string = "ArraySet";

  constructor(path: Path, noOp: boolean, public value: any[]) {
    super(ArraySetOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArraySetOperation {
    return new ArraySetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ArrayReplaceOperation extends DiscreteOperation {

  static TYPE: string = "ArrayReplace";

  constructor(path: Path, noOp: boolean, public index: number, public value: any) {
    super(ArrayReplaceOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}


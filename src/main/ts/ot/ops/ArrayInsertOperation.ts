import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ArrayInsertOperation extends DiscreteOperation {

  static TYPE: string = "ArrayInsert";

  constructor(path: Path, noOp: boolean, public index: number, public value: any) {
    super(ArrayInsertOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayInsertOperation {
    return new ArrayInsertOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

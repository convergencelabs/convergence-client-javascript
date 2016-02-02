import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";

export default class StringRemoveOperation extends DiscreteOperation {

  static TYPE: string = "StringRemove";

  constructor(path: Array<string | number>, noOp: boolean, public index: number, public value: string) {
    super(StringRemoveOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringRemoveOperation {
    return new StringRemoveOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

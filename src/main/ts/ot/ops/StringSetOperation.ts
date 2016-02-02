import DiscreteOperation from "./DiscreteOperation";
import Immutable from "../../util/Immutable";

export default class StringSetOperation extends DiscreteOperation {

  static TYPE: string = "StringSet";

  constructor(path: Array<string | number>, public noOp: boolean, public value: string) {
    super(StringSetOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringSetOperation {
    return new StringSetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


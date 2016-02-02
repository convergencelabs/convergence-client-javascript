import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";

export default class BooleanSetOperation extends DiscreteOperation {

  static TYPE: string = "BooleanSet";

  constructor(path: Array<string | number>, noOp: boolean, public value: boolean) {
    super(BooleanSetOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): BooleanSetOperation {
    return new BooleanSetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

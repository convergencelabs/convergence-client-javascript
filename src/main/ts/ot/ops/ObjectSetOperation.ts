import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";

export default class ObjectSetOperation extends DiscreteOperation {

  static TYPE: string = "ObjectSet";

  constructor(path: Array<string | number>, noOp: boolean, public value: any) {
    super(ObjectSetOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectSetOperation {
    return new ObjectSetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

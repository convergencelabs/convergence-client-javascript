import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ObjectSetPropertyOperation extends DiscreteOperation {

  static TYPE: string = "ObjectSetProperty";

  constructor(path: Path, noOp: boolean, public prop: string, public value: any) {
    super(ObjectSetPropertyOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

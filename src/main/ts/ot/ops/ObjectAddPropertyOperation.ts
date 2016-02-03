import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class ObjectAddPropertyOperation extends DiscreteOperation {

  static TYPE: string = "ObjectAddProperty";

  constructor(path: Path, noOp: boolean, public prop: string, public value: any) {
    super(ObjectAddPropertyOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

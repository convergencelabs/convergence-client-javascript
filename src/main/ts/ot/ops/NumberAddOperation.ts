import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";

export default class NumberAddOperation extends DiscreteOperation {

  static TYPE: string = "NumberAdd";

  protected _value: number;

  constructor(path: Path, noOp: boolean, public value: number) {
    super(NumberAddOperation.TYPE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): NumberAddOperation {
    return new NumberAddOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


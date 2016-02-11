import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class NumberAddOperation extends DiscreteOperation {

  protected _value: number;

  constructor(path: Path, noOp: boolean, public value: number) {
    super(OperationType.NUMBER_ADD, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): NumberAddOperation {
    return new NumberAddOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


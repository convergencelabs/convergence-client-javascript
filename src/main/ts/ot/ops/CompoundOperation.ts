import Operation from "./Operation";
import DiscreteOperation from "./DiscreteOperation";
import Immutable from "../../util/Immutable";

export default class CompoundOperation extends Operation {

  static TYPE: string = "Compound";

  constructor(public ops: DiscreteOperation[]) {
    super(CompoundOperation.TYPE);
    Object.freeze(this);
  }

  copy(updates: any): CompoundOperation {
    return new CompoundOperation(Immutable.update(this.ops, updates.ops));
  }
}

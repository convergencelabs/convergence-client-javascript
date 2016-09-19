import {AppliedOperation} from "./AppliedOperation";
import {CompoundOperation} from "../ops/CompoundOperation";
import {DiscreteOperation} from "../ops/DiscreteOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedCompoundOperation extends CompoundOperation implements AppliedOperation {
  constructor(ops: DiscreteOperation[]) {
    super(ops);
    Object.freeze(this);
  }

  copy(updates: any): AppliedCompoundOperation {
    return new AppliedCompoundOperation(Immutable.update(this.ops, updates.ops));
  }

  inverse(): AppliedCompoundOperation {
    return new AppliedCompoundOperation(this.ops.map((op) => {
      // fixme: Figure out how to do this correctly
      return <DiscreteOperation>(<any>(<AppliedOperation> (<any> op))).inverse();
    }));
  }
}

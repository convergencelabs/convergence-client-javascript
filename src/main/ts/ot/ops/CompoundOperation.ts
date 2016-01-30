/// <reference path="Operation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class CompoundOperation extends Operation {

    static TYPE: string = "Compound";

    constructor(public ops: DiscreteOperation[]) {
      super(CompoundOperation.TYPE);
      Object.freeze(this);
    }

    copy(updates: any): CompoundOperation {
      return new CompoundOperation(Immutable.update(this.ops, updates.ops));
    }
  }
}

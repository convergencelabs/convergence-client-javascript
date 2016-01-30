/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class BooleanSetOperation extends DiscreteOperation {

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
}

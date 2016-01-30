/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ArrayRemoveOperation extends DiscreteOperation {

    static TYPE: string = "ArrayRemove";

    constructor(path: Array<string | number>, noOp: boolean, public index: number) {
      super(ArrayRemoveOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ArrayRemoveOperation {
      return new ArrayRemoveOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.index, updates.index));
    }
  }
}

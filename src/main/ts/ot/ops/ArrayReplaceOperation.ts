/// <reference path="DiscreteOperation.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ArrayReplaceOperation extends DiscreteOperation {

    static TYPE: string = "ArrayReplace";

    constructor(path: Array<string | number>, noOp: boolean, public index: number, public value: any) {
      super(ArrayReplaceOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ArrayReplaceOperation {
      return new ArrayReplaceOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.index, updates.index),
        Immutable.update(this.value, updates.value));
    }
  }
}

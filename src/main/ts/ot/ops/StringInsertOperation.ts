/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class StringInsertOperation extends DiscreteOperation {

    static TYPE: string = "StringInsert";

    constructor(path: Array<string | number>, noOp: boolean, public index: number, public value: string) {
      super(StringInsertOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): StringInsertOperation {
      return new StringInsertOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.index, updates.index),
        Immutable.update(this.value, updates.value));
    }
  }
}

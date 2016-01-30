/// <reference path="DiscreteOperation.ts" />

module convergence.ot {
  import Immutable = convergence.util.Immutable;

  export class ArrayInsertOperation extends DiscreteOperation {

    static TYPE: string = "ArrayInsert";

    constructor(path: Array<string | number>, noOp: boolean, public index: number, public value: any) {
      super(ArrayInsertOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ArrayInsertOperation {
      return new ArrayInsertOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.index, updates.index),
        Immutable.update(this.value, updates.value));
    }
  }
}

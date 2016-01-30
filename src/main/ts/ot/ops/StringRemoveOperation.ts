/// <reference path="DiscreteOperation.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class StringRemoveOperation extends DiscreteOperation {

    static TYPE: string = "StringRemove";

    constructor(path: Array<string | number>, noOp: boolean, public index: number, public value: string) {
      super(StringRemoveOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): StringRemoveOperation {
      return new StringInsertOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.index, updates.index),
        Immutable.update(this.value, updates.value));
    }
  }
}

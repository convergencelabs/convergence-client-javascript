/// <reference path="DiscreteOperation.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class NumberSetOperation extends DiscreteOperation {

    static TYPE: string = "NumberSet";

    constructor(path: Array<string | number>, noOp: boolean, public value: number) {
      super(NumberSetOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): NumberSetOperation {
      return new NumberSetOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.value, updates.value));
    }
  }
}

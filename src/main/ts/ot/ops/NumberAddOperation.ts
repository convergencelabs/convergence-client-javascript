/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class NumberAddOperation extends DiscreteOperation {

    static TYPE: string = "NumberAdd";

    protected _value: number;

    constructor(path: Array<string | number>, noOp: boolean, public value: number) {
      super(NumberAddOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): NumberAddOperation {
      return new NumberAddOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.value, updates.value));
    }
  }
}

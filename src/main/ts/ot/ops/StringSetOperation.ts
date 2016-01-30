/// <reference path="DiscreteOperation.ts" />

module convergence.ot {
  import Immutable = convergence.util.Immutable;
  export class StringSetOperation extends DiscreteOperation {

    static TYPE: string = "StringSet";

    constructor(path: Array<string | number>, public noOp: boolean, public value: string) {
      super(StringSetOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): StringSetOperation {
      return new StringSetOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.value, updates.value));
    }
  }
}

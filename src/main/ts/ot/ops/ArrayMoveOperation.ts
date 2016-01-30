/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ArrayMoveOperation extends DiscreteOperation {

    static TYPE: string = "ArrayMove";

    constructor(path: Array<string | number>, noOp: boolean, public fromIndex: number, public toIndex: number) {
      super(ArrayMoveOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ArrayMoveOperation {
      return new ArrayMoveOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.fromIndex, updates.fromIndex),
        Immutable.update(this.toIndex, updates.toIndex));
    }
  }
}

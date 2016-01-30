/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ObjectRemovePropertyOperation extends DiscreteOperation {

    static TYPE: string = "ObjectRemoveProperty";

    protected _prop: string;

    constructor(path: Array<string | number>, noOp: boolean, public prop: string) {
      super(ObjectRemovePropertyOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ObjectRemovePropertyOperation {
      return new ObjectRemovePropertyOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.prop, updates.prop));
    }
  }
}

/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ObjectSetPropertyOperation extends DiscreteOperation {

    static TYPE: string = "ObjectSetProperty";

    constructor(path: Array<string | number>, noOp: boolean, public prop: string, public value: any) {
      super(ObjectSetPropertyOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ObjectSetPropertyOperation {
      return new ObjectSetPropertyOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.prop, updates.prop),
        Immutable.update(this.value, updates.value));
    }
  }
}

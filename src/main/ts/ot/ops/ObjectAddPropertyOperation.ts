/// <reference path="DiscreteOperation.ts" />
/// <reference path="../../util/Immutable.ts" />

module convergence.ot {

  import Immutable = convergence.util.Immutable;
  export class ObjectAddPropertyOperation extends DiscreteOperation {

    static TYPE: string = "ObjectAddProperty";

    constructor(path: Array<string | number>, noOp: boolean, public prop: string, public value: any) {
      super(ObjectAddPropertyOperation.TYPE, path, noOp);
      Object.freeze(this);
    }

    copy(updates: any): ObjectAddPropertyOperation {
      return new ObjectAddPropertyOperation(
        Immutable.update(this.path, updates.path),
        Immutable.update(this.noOp, updates.noOp),
        Immutable.update(this.prop, updates.prop),
        Immutable.update(this.value, updates.value));
    }
  }
}

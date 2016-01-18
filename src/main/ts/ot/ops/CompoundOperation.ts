/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class CompoundOperation implements Operation {

    static TYPE:string = "Compound";

    protected _ops:DiscreteOperation[];

    constructor(ops:DiscreteOperation[]) {
      this._ops = ops;
    }

    get ops():DiscreteOperation[] {
      return this._ops;
    }

    copy(properties:any):CompoundOperation {
      return new CompoundOperation(properties.ops || this._ops);
    }

    type():string {
      return CompoundOperation.TYPE;
    }
  }
}
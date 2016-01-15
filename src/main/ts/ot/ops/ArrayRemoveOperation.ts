/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ArrayRemoveOperation extends DiscreteOperation implements ArrayOperation {

    static TYPE:string = "ArrayRemove";

    protected _index:number;

    constructor(path:Array<string | number>, noOp:boolean, index:number) {
      super(path, noOp);
      this._index = index;
    }

    get index():number {
      return this._index;
    }

    copy(properties:any):ArrayRemoveOperation {
      return new ArrayRemoveOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.index || this._index);
    }

    type():string {
      return ArrayRemoveOperation.TYPE;
    }
  }
}
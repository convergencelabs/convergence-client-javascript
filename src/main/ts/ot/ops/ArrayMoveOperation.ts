/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ArrayMoveOperation extends DiscreteOperation implements ArrayOperation {

    static TYPE:string = "ArrayMove";

    protected _fromIndex:number;
    protected _toIndex:number;

    constructor(path:Array<string | number>, noOp:boolean, fromIndex:number, toIndex:number) {
      super(path, noOp);
      this._fromIndex = fromIndex;
      this._toIndex = toIndex;
    }

    get fromIndex():number {
      return this._fromIndex;
    }

    get toIndex():any {
      return this._toIndex;
    }

    copy(properties:any):ArrayMoveOperation {
      return new ArrayMoveOperation(
        properties.path || this._path,
        properties.noOp !== undefined ? properties.noOp : this._noOp,
        properties.fromIndex || this._fromIndex,
        properties.toIndex || this._toIndex);
    }

    type():string {
      return ArrayMoveOperation.TYPE;
    }
  }
}
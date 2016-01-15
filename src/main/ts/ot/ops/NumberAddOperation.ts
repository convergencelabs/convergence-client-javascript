/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class NumberAddOperation extends DiscreteOperation implements NumberOperation {

    static TYPE:string = "NumberAdd";

    protected _value:number;

    constructor(path:Array<string | number>, noOp:boolean, value:number) {
      super(path, noOp);
      this._value = value;
    }

    get value():number {
      return this._value;
    }

    copy(properties:any):NumberAddOperation {
      return new NumberAddOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type():string {
      return NumberAddOperation.TYPE;
    }
  }
}
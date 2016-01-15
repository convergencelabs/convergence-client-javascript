/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ObjectSetOperation extends DiscreteOperation implements ObjectOperation {

    static TYPE:string = "ObjectSet";

    // FIXME this should be an object
    protected _value:any;

    constructor(path:Array<string | number>, noOp:boolean, value:any) {
      super(path, noOp);
      this._value = value;
    }

    get value():any {
      return this._value;
    }

    copy(properties:any):ObjectSetOperation {
      return new ObjectSetOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type():string {
      return ObjectSetOperation.TYPE;
    }
  }
}
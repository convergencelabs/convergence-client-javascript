/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ObjectSetPropertyOperation extends DiscreteOperation implements ObjectOperation {

    static TYPE:string = "ObjectSetProperty";

    // FIXME this should be an object
    protected _value:any;
    protected _prop:string;

    constructor(path:Array<string | number>, noOp:boolean, prop:string, value:any) {
      super(path, noOp);
      this._prop = prop;
      this._value = value;
    }

    get prop():string {
      return this._prop;
    }

    get value():any {
      return this._value;
    }

    copy(properties:any):ObjectSetPropertyOperation {
      return new ObjectSetPropertyOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.prop || this._prop,
        properties.value || this._value);
    }

    type():string {
      return ObjectSetPropertyOperation.TYPE;
    }
  }
}
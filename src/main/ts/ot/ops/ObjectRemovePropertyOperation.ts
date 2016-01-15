/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ObjectRemovePropertyOperation extends DiscreteOperation implements ObjectOperation {

    static TYPE:string = "ObjectRemoveProperty";

    // FIXME this should be an object
    protected _prop:string;

    constructor(path:Array<string | number>, noOp:boolean, prop:string) {
      super(path, noOp);
      this._prop = prop;
    }

    get prop():string {
      return this._prop;
    }

    copy(properties:any):ObjectRemovePropertyOperation {
      return new ObjectRemovePropertyOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.prop || this._prop);
    }

    type():string {
      return ObjectRemovePropertyOperation.TYPE;
    }
  }
}
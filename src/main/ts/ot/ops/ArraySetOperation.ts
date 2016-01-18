/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ArraySetOperation extends DiscreteOperation implements ArrayOperation {

    static TYPE: string = "ArraySet";

    protected _value: any;

    constructor(path: Array<string | number>, noOp: boolean, value: any[]) {
      super(path, noOp);
      this._value = value;
    }

    get value(): any[] {
      return this._value;
    }

    copy(properties: any): ArraySetOperation {
      return new ArraySetOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type(): string {
      return ArraySetOperation.TYPE;
    }
  }
}

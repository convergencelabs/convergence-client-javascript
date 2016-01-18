/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class BooleanSetOperation extends DiscreteOperation {

    static TYPE: string = "BooleanSet";

    protected _value: boolean;

    constructor(path: Array<string | number>, noOp: boolean, value: boolean) {
      super(path, noOp);
      this._value = value;
    }

    get value(): boolean {
      return this._value;
    }

    copy(properties: any): BooleanSetOperation {
      return new BooleanSetOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type(): string {
      return BooleanSetOperation.TYPE;
    }
  }
}

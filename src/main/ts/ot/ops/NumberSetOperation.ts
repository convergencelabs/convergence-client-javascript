/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class NumberSetOperation extends DiscreteOperation implements NumberOperation {

    static TYPE: string = "NumberSet";

    protected _value: number;

    constructor(path: Array<string | number>, noOp: boolean, value: number) {
      super(path, noOp);
      this._value = value;
    }

    get value(): number {
      return this._value;
    }

    copy(properties: any): NumberSetOperation {
      return new NumberSetOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type(): string {
      return NumberSetOperation.TYPE;
    }
  }
}

/// <reference path="DiscreteOperation.ts" />

module convergence.ot {
  export class StringOperation extends DiscreteOperation {

    protected _value: string;

    constructor(path: Array<string | number>, noOp: boolean, value: string) {
      super(path, noOp);
      this._value = value;
    }

    get value(): string {
      return this._value;
    }
  }
}

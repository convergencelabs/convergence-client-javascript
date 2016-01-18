/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class ArrayInsertOperation extends DiscreteOperation implements ArrayOperation {

    static TYPE: string = "ArrayInsert";

    protected _index: number;
    protected _value: any;

    constructor(path: Array<string | number>, noOp: boolean, index: number, value: any) {
      super(path, noOp);
      this._index = index;
      this._value = value;
    }

    get index(): number {
      return this._index;
    }

    get value(): any {
      return this._value;
    }

    copy(properties: any): ArrayInsertOperation {
      return new ArrayInsertOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.index || this._index,
        properties.value || this._value);
    }

    type(): string {
      return ArrayInsertOperation.TYPE;
    }
  }
}

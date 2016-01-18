/// <reference path="StringOperation.ts" />

module convergence.ot {

  export class StringInsertOperation extends StringOperation {

    static TYPE: string = "StringInsert";

    protected _index: number;

    constructor(path: Array<string | number>, noOp: boolean, index: number, value: string) {
      super(path, noOp, value);
      this._index = index;
    }

    get index(): number {
      return this._index;
    }

    copy(properties: any): StringInsertOperation {
      return new StringInsertOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.index || this._index,
        properties.value || this._value);
    }

    type(): string {
      return StringInsertOperation.TYPE;
    }
  }
}

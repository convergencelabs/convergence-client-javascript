/// <reference path="StringOperation.ts" />

module convergence.ot {
  export class StringSetOperation extends StringOperation {

    static TYPE: string = "StringSet";

    constructor(path: Array<string | number>, noOp: boolean, value: string) {
      super(path, noOp, value);
    }

    copy(properties: any): StringSetOperation {
      return new StringSetOperation(
        properties.path || this._path,
        properties.noOp || this._noOp,
        properties.value || this._value);
    }

    type(): string {
      return StringSetOperation.TYPE;
    }
  }
}

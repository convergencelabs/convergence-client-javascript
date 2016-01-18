/// <reference path="Operation.ts" />

module convergence.ot {
  export class DiscreteOperation implements Operation {

    protected _path: Array<string | number>;
    protected _noOp: boolean;

    constructor(path: Array<string | number>, noOp: boolean) {
      this._path = path;
      this._noOp = noOp;
    }

    get path(): Array<string | number> {
      return this._path;
    }

    get noOp(): boolean {
      return this._noOp;
    }

    // fixme hack, figure out how to make this abstract
    copy(properties: any): DiscreteOperation {
      return this;
    }

    type(): string {
      return "DiscreteOperation";
    }
  }
}

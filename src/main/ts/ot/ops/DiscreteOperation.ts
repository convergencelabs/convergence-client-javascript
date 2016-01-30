/// <reference path="Operation.ts" />

module convergence.ot {
  export type Path = Array<string | number>;

  export abstract class DiscreteOperation extends Operation {
    constructor(type: string, public path: Path, public noOp: boolean) {
      super(type);
    }
  }
}

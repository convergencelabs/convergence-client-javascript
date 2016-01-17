/// <reference path="OperationPair.ts" />

module convergence.ot {
  export interface PathTransformationFunction<A extends DiscreteOperation> {
    transformDescendantPath(ancestorOp:A, descendantPath:Array<string | number>): PathTransformation
  }

  export class PathTransformation {
    _result: PathTransformationResult;
    _path: Array<string | number>;

    constructor(result:PathTransformationResult, path:Array<string | number>) {
      this._result = result;
      this._path = path;
    }

    get result(): PathTransformationResult {
      return this._result;
    }

    get path(): Array<string | number> {
      return this._path;
    }
  }

  export enum PathTransformationResult {
    NoTransformation, PathObsoleted, PathUpdated
  }
}
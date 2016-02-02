import DiscreteOperation from "../ops/DiscreteOperation";
import {Path} from "../Path";

export interface PathTransformationFunction<A extends DiscreteOperation> {
  transformDescendantPath(ancestorOp: A, descendantPath: Path): PathTransformation;
}

export class PathTransformation {
  _result: PathTransformationResult;
  _path: Path;

  constructor(result: PathTransformationResult, path: Path) {
    this._result = result;
    this._path = path;
  }

  get result(): PathTransformationResult {
    return this._result;
  }

  get path(): Path {
    return this._path;
  }
}

export enum PathTransformationResult {
  NoTransformation, PathObsoleted, PathUpdated
}


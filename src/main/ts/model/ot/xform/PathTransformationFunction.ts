import DiscreteOperation from "../ops/DiscreteOperation";
import {Path} from "../Path";

export interface PathTransformationFunction<A extends DiscreteOperation> {
  transformDescendantPath(ancestorOp: A, descendantPath: Path): PathTransformation;
}

export class PathTransformation {
  constructor(public result: PathTransformationResult, public path: Path) {
    Object.freeze(this);
  }
}

export enum PathTransformationResult {
  NoTransformation, PathObsoleted, PathUpdated
}


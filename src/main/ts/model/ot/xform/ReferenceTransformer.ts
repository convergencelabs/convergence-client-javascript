import Operation from "../ops/Operation";
import CompoundOperation from "../ops/CompoundOperation";
import DiscreteOperation from "../ops/DiscreteOperation";
import {PathTransformationResult} from "./PathTransformationFunction";
import {PathTransformationFunction} from "./PathTransformationFunction";
import TransformationFunctionRegistry from "./TransformationFunctionRegistry";
import PathComparator from "../util/PathComparator";
import {PathTransformation} from "./PathTransformationFunction";
import {Path} from "../Path";
import Immutable from "../../../util/Immutable";
import {ReferenceTransformationFunction} from "./ReferenceTransformationFunction";

export interface ModelReferenceData {
  path: Path;
  type: string;
  value: any;
}

export class ReferenceTransformer {
  private _tfr: TransformationFunctionRegistry;

  constructor(tfr: TransformationFunctionRegistry) {
    this._tfr = tfr;
  }

  transform(o: Operation, r: ModelReferenceData): ModelReferenceData {
    if (o instanceof CompoundOperation) {
      return this.transformCompoundOperation(o, r);
    } else {
      return this.transformDiscreteOperation(<DiscreteOperation>o, r);
    }
  }

  private transformCompoundOperation(o: CompoundOperation, r: ModelReferenceData): ModelReferenceData {
    var result: ModelReferenceData = r;
    for (var i: number = 0; i < o.ops.length && result; i++) {
      result = this.transform(o.ops[i], result);
    }
    return result;
  }

  private transformDiscreteOperation(s: DiscreteOperation, r: ModelReferenceData): ModelReferenceData {
    if (s.noOp) {
      return r;
    } else if (PathComparator.areEqual(s.path, r.path)) {
      return this.transformWithIdenticalPathOperation(s, r);
    } else if (PathComparator.isAncestorOf(s.path, r.path)) {
      return this.transformWithAncestorOperation(s, r);
    } else {
      return r;
    }
  }

  private transformWithIdenticalPathOperation(o: DiscreteOperation, r: ModelReferenceData): ModelReferenceData {
    var tf: ReferenceTransformationFunction = this._tfr.getReferenceTransformationFunction(o, r);
    if (tf) {
      return tf(o, r);
    } else {
      throw new Error(
        `No operation transformation function found for operation pair (${o.type},${r.type})`);
    }
  }

  private transformWithAncestorOperation(a: DiscreteOperation, r: ModelReferenceData): ModelReferenceData {
    var ptf: PathTransformationFunction<any> = this._tfr.getPathTransformationFunction(a);
    if (ptf) {
      var result: PathTransformation = ptf.transformDescendantPath(a, r.path);
      switch (result.result) {
        case PathTransformationResult.NoTransformation:
          return r;
        case PathTransformationResult.PathObsoleted:
          return null;
        case PathTransformationResult.PathUpdated:
          return <ModelReferenceData>Immutable.copy(r, {path: result.path});
        default:
          throw new Error("Invalid path transformation result");
      }
    } else {
      throw new Error(`No path transformation function found for ancestor operation: ${a.type}`);
    }
  }
}

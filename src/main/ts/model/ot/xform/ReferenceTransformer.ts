import {Operation} from "../ops/Operation";
import {CompoundOperation} from "../ops/CompoundOperation";
import {DiscreteOperation} from "../ops/DiscreteOperation";
import {TransformationFunctionRegistry} from "./TransformationFunctionRegistry";
import {ReferenceTransformationFunction} from "./ReferenceTransformationFunction";

export interface ModelReferenceData {
  type: string;
  id: string;
  values: any[];
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
    } else if (s.id === r.id) {
      return this.transformWithIdenticalPathOperation(s, r);
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
}

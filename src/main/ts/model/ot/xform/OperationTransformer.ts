import Operation from "../ops/Operation";
import CompoundOperation from "../ops/CompoundOperation";
import OperationPair from "./OperationPair";
import DiscreteOperation from "../ops/DiscreteOperation";
import {PathTransformationResult} from "./PathTransformationFunction";
import {PathTransformationFunction} from "./PathTransformationFunction";
import TransformationFunctionRegistry from "./TransformationFunctionRegistry";
import PathComparator from "../util/PathComparator";
import OperationTransformationFunction from "./OperationTransformationFunction";
import {PathTransformation} from "./PathTransformationFunction";

export default class OperationTransformer {
  private _tfr: TransformationFunctionRegistry;

  constructor(tfr: TransformationFunctionRegistry) {
    this._tfr = tfr;
  }

  transform(s: Operation, c: Operation): OperationPair {
    if (s instanceof CompoundOperation) {
      return this.transformServerCompoundOperation(s, c);
    } else if (c instanceof CompoundOperation) {
      return this.transformClientCompoundOperation(s, c);
    } else {
      return this.transformTwoDiscreteOps(<DiscreteOperation>s, <DiscreteOperation>c);
    }
  }

  private transformClientCompoundOperation(s: Operation, c: CompoundOperation): OperationPair {
    var xFormedS: Operation = s;
    var newOps: DiscreteOperation[] = c.ops.map(function (o: DiscreteOperation): DiscreteOperation {
      var opPair: OperationPair = this.transform(xFormedS, o);
      xFormedS = opPair.serverOp;
      return <DiscreteOperation>opPair.clientOp;
    });
    return new OperationPair(xFormedS, new CompoundOperation(newOps));
  }

  private transformServerCompoundOperation(s: CompoundOperation, c: Operation): OperationPair {
    var xFormedC: Operation = c;
    var newOps: DiscreteOperation[] = s.ops.map(function (o: DiscreteOperation): DiscreteOperation {
      var opPair: OperationPair = this.transform(o, xFormedC);
      xFormedC = opPair.clientOp;
      return <DiscreteOperation>opPair.serverOp;
    });
    return new OperationPair(new CompoundOperation(newOps), xFormedC);
  }

  private transformTwoDiscreteOps(s: DiscreteOperation, c: DiscreteOperation): OperationPair {
    if (s.noOp || c.noOp) {
      return new OperationPair(s, c);
    } else if (PathComparator.areEqual(s.path, c.path)) {
      return this.transformIdenticalPathOperations(s, c);
    } else if (PathComparator.isAncestorOf(s.path, c.path)) {
      return this.transformHierarchicalOperations(s, c);
    } else if (PathComparator.isAncestorOf(c.path, s.path)) {
      var tmp: OperationPair = this.transformHierarchicalOperations(c, s);
      return new OperationPair(tmp.clientOp, tmp.serverOp);
    } else {
      return new OperationPair(s, c);
    }
  }

  private transformIdenticalPathOperations(s: DiscreteOperation, c: DiscreteOperation): OperationPair {
    var tf: OperationTransformationFunction<any, any> = this._tfr.getOperationTransformationFunction(s, c);
    if (tf) {
      return tf.transform(s, c);
    } else {
      throw new Error(
        `No operation transformation function found for operation pair (${s.type},${s.type})`);
    }
  }

  private transformHierarchicalOperations(a: DiscreteOperation, d: DiscreteOperation): OperationPair {
    var ptf: PathTransformationFunction<any> = this._tfr.getPathTransformationFunction(a);
    if (ptf) {
      var result: PathTransformation = ptf.transformDescendantPath(a, d.path);
      switch (result.result) {
        case PathTransformationResult.NoTransformation:
          return new OperationPair(a, d);
        case PathTransformationResult.PathObsoleted:
          return new OperationPair(a, d.copy({noOp: true}));
        case PathTransformationResult.PathUpdated:
          return new OperationPair(a, d.copy({path: result.path}));
        default:
          throw new Error("Invalid path transformation result");
      }
    } else {
      throw new Error(`No path transformation function found for ancestor operation: ${a.type}`);
    }
  }
}


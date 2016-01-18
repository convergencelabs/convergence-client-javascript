/// <reference path="OperationTransformationFunction.ts" />
/// <reference path="../ops/StringInsertOperation.ts" />
/// <reference path="../ops/StringRemoveOperation.ts" />
/// <reference path="../ops/StringSetOperation.ts" />

import OperationPair = convergence.ot.OperationPair;
module convergence.ot {
  export class OperationTransformer {
    private _tfr: TransformationFunctionRegistry;

    constructor(tfr: TransformationFunctionRegistry) {
      this._tfr = tfr;
    }

    transform(s:Operation, c:Operation):OperationPair {
      if (s instanceof CompoundOperation) {
        return this.transformServerCompoundOperation(s, c);
      } else if (c instanceof CompoundOperation) {
        return this.transformClientCompoundOperation(s, c);
      } else {
        return this.transformTwoDiscreteOps(<DiscreteOperation>s, <DiscreteOperation>c);
      }
    }

    private transformClientCompoundOperation(s:Operation, c:CompoundOperation):OperationPair {
      var xFormedS = s;
      var newOps = c.ops.map(function (o) {
        var opPair = this.transform(xFormedS, o);
        xFormedS = opPair.serverOp;
        return opPair.clientOp;
      });
      return new OperationPair(xFormedS, CompoundOperation(newOps))
    }

    private transformServerCompoundOperation(s:CompoundOperation, c:Operation) {
      var xFormedC = c;
      var newOps = s.ops.map(function (o) {
        var opPair = this.transform(o, xFormedC);
        xFormedC = opPair.clientOp;
        return opPair.serverOp;
      });
      return new OperationPair(CompoundOperation(newOps), xFormedC)
    }

    private transformTwoDiscreteOps(s:DiscreteOperation, c:DiscreteOperation):OperationPair {
      if (s.noOp || c.noOp) {
        return new OperationPair(s, c)
      } else if (PathComparator.areEqual(s.path, c.path)) {
        return this.transformIdenticalPathOperations(s, c)
      } else if (PathComparator.isAncestorOf(s.path, c.path)) {
        return this.transformHierarchicalOperations(s, c)
      } else if (PathComparator.isAncestorOf(c.path, s.path)) {
        var tmp = this.transformHierarchicalOperations(c, s);
        return new OperationPair(s, c);
      } else {
        return new OperationPair(s, c);
      }
    }

    private transformIdenticalPathOperations(s:DiscreteOperation, c:DiscreteOperation):OperationPair {
      var tf = this._tfr.getOperationTransformationFunction(s, c);
      if (tf) {
        return tf.transform(s, c);
      } else {
        throw new Error(
          "No operation transformation function found for operation pair (${s.getClass.getName},${s.getClass.getName})")
      }
    }

    private transformHierarchicalOperations(a:DiscreteOperation, d:DiscreteOperation):OperationPair {
      var ptf = this._tfr.getPathTransformationFunction(a);
      if (ptf) {
        var result = ptf.transformDescendantPath(a, d.path);
        switch (result.result) {
          case PathTransformationResult.NoTransformation:
            return new OperationPair(a, d);
          case PathTransformationResult.PathObsoleted:
            return new OperationPair(a, d.copy({noOp: true}));
          case PathTransformationResult.PathUpdated:
            return new OperationPair(a, d.copy({path: result.path}));
        }
      } else {
        throw new Error("No path transformation function found for ancestor operation: ${a.getClass.getName}")
      }
    }
  }
}

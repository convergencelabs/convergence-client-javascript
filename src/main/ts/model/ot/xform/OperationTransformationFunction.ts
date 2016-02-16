import DiscreteOperation from "../ops/DiscreteOperation";
import OperationPair from "./OperationPair";

interface OperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation> {
  transform(s: S, c: C): OperationPair;
}

export default OperationTransformationFunction

import {DiscreteOperation} from "../ops/DiscreteOperation";
import {OperationPair} from "./OperationPair";

export type OperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation> =
  (s: S, c: C) => OperationPair;

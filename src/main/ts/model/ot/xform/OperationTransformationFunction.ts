import {DiscreteOperation} from "../ops/DiscreteOperation";
import {OperationPair} from "./OperationPair";

/**
 * @hidden
 * @internal
 */
export type OperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation> =
  (s: S, c: C) => OperationPair;

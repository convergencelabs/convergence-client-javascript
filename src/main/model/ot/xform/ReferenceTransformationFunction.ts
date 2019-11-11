import {DiscreteOperation} from "../ops/DiscreteOperation";
import {ModelReferenceData} from "./ReferenceTransformer";

/**
 * @hidden
 * @internal
 */
export type ReferenceTransformationFunction = (o: DiscreteOperation, r: ModelReferenceData) => ModelReferenceData;

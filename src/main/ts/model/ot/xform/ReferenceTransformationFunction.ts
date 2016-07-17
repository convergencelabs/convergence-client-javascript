import {DiscreteOperation} from "../ops/DiscreteOperation";
import {ModelReferenceData} from "./ReferenceTransformer";

export type ReferenceTransformationFunction = (o: DiscreteOperation, r: ModelReferenceData) => ModelReferenceData;

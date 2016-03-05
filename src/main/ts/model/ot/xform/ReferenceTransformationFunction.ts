import DiscreteOperation from "../ops/DiscreteOperation";
import {ModelReferenceData} from "./ReferenceTransformer";


export interface ReferenceTransformationFunction<O extends DiscreteOperation> {
  transform(o: O, r: ModelReferenceData): ModelReferenceData;
}

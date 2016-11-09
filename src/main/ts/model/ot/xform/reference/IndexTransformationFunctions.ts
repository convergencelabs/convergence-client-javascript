import {ReferenceTransformationFunction} from "../ReferenceTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";
import {ModelReferenceData} from "../ReferenceTransformer";
import {IndexTransformer} from "./IndexTransformer";
import {Immutable} from "../../../../util/Immutable";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";

///////////////////////////////////////////////////////////////////////////////
// String Operations
///////////////////////////////////////////////////////////////////////////////

export const StringInsertIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringInsertOperation, r: ModelReferenceData) => {
    const values: number[] = IndexTransformer.handleInsert(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

export const StringRemoveIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringRemoveOperation, r: ModelReferenceData) => {
    const values: number[] = IndexTransformer.handleRemove(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

export const StringSetIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringSetOperation, r: ModelReferenceData) => {
    return null;
  };

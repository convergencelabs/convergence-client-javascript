import {ReferenceTransformationFunction} from "../ReferenceTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";
import {ModelReferenceData} from "../ReferenceTransformer";
import {Immutable} from "../../../../util/Immutable";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {IndexRange} from "../../../reference/RangeReference";
import {RangeTransformer} from "./RangeTransformer";

///////////////////////////////////////////////////////////////////////////////
// String Operations
///////////////////////////////////////////////////////////////////////////////

export const StringInsertRangeTransformationFunction: ReferenceTransformationFunction =
  (o: StringInsertOperation, r: ModelReferenceData) => {
    const values: IndexRange[] = RangeTransformer.handleInsert(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

export const StringRemoveRangeTransformationFunction: ReferenceTransformationFunction =
  (o: StringRemoveOperation, r: ModelReferenceData) => {
    const values: IndexRange[] = RangeTransformer.handleRemove(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

export const StringSetRangeTransformationFunction: ReferenceTransformationFunction =
  (o: StringSetOperation, r: ModelReferenceData) => {
    return null;
  };

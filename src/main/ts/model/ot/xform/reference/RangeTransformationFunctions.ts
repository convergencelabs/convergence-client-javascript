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
  function (o: StringInsertOperation, r: ModelReferenceData): ModelReferenceData {
    const values: IndexRange[] = RangeTransformer.handleInsert(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values: values});
  };

export const StringRemoveRangeTransformationFunction: ReferenceTransformationFunction =
  function (o: StringRemoveOperation, r: ModelReferenceData): ModelReferenceData {
    const values: IndexRange[] = RangeTransformer.handleRemove(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values: values});
  };

export const StringSetRangeTransformationFunction: ReferenceTransformationFunction =
  function (o: StringSetOperation, r: ModelReferenceData): ModelReferenceData {
    return null;
  };

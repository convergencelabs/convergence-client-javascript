import {ReferenceTransformationFunction} from "../ReferenceTransformationFunction";
import StringInsertOperation from "../../ops/StringInsertOperation";
import {ModelReferenceData} from "../ReferenceTransformer";
import {IndexTransformer} from "./IndexTransformer";
import Immutable from "../../../../util/Immutable";
import StringSetOperation from "../../ops/StringSetOperation";
import StringRemoveOperation from "../../ops/StringRemoveOperation";

///////////////////////////////////////////////////////////////////////////////
// String Operations
///////////////////////////////////////////////////////////////////////////////

export var StringInsertRangeTransformationFunction: ReferenceTransformationFunction =
  function (o: StringInsertOperation, r: ModelReferenceData): ModelReferenceData {
    var xformed: number[] = IndexTransformer.handleInsert([r.value.start, r.value.end], o.index, o.value.length);
    return Immutable.copy(r, {value: {start: xformed[0], end: xformed[1]}});
  };

export var StringRemoveRangeTransformationFunction: ReferenceTransformationFunction =
  function (o: StringRemoveOperation, r: ModelReferenceData): ModelReferenceData {
    var xformed: number[] = IndexTransformer.handleRemove([r.value.start, r.value.end], o.index, o.value.length);
    return Immutable.copy(r, {value: {start: xformed[0], end: xformed[1]}});
  };

export var StringSetRangeTransformationFunction: ReferenceTransformationFunction =
  function (o: StringSetOperation, r: ModelReferenceData): ModelReferenceData {
    return null;
  };

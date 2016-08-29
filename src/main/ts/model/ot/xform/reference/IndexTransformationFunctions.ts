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

export var StringInsertIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringInsertOperation, r: ModelReferenceData): ModelReferenceData {
    var values: number[] = IndexTransformer.handleInsert(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values: values});
  };

export var StringRemoveIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringRemoveOperation, r: ModelReferenceData): ModelReferenceData {
    var values: number[] = IndexTransformer.handleRemove(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values: values});
  };

export var StringSetIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringSetOperation, r: ModelReferenceData): ModelReferenceData {
    return null;
  };

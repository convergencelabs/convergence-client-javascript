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

export var StringInsertIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringInsertOperation, r: ModelReferenceData): ModelReferenceData {
    var newIndex: number = IndexTransformer.handleInsert([r.value], o.index, o.value.length)[0];
    return Immutable.copy(r, {value: newIndex});
  };

export var StringRemoveIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringRemoveOperation, r: ModelReferenceData): ModelReferenceData {
    var newIndex: number = IndexTransformer.handleRemove([r.value], o.index, o.value.length)[0];
    return Immutable.copy(r, {value: newIndex});
  };

export var StringSetIndexTransformationFunction: ReferenceTransformationFunction =
  function (o: StringSetOperation, r: ModelReferenceData): ModelReferenceData {
    return null;
  };

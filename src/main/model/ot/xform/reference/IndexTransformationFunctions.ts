/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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

/**
 * @hidden
 * @internal
 */
export const StringInsertIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringInsertOperation, r: ModelReferenceData) => {
    const values: number[] = IndexTransformer.handleInsert(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

/**
 * @hidden
 * @internal
 */
export const StringRemoveIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringRemoveOperation, r: ModelReferenceData) => {
    const values: number[] = IndexTransformer.handleRemove(r.values, o.index, o.value.length);
    return Immutable.copy(r, {values});
  };

/**
 * @hidden
 * @internal
 */
export const StringSetIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringSetOperation, r: ModelReferenceData) => {
    return null;
  };

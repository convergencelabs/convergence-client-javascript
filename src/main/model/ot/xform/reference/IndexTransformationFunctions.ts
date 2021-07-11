/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ReferenceTransformationFunction} from "../ReferenceTransformationFunction";
import {ModelReferenceData} from "../ReferenceTransformer";
import {IndexTransformer} from "./IndexTransformer";
import {Immutable} from "../../../../util/Immutable";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringSpliceOperation} from "../../ops/StringSpliceOperation";

///////////////////////////////////////////////////////////////////////////////
// String Operations
///////////////////////////////////////////////////////////////////////////////

/**
 * @hidden
 * @internal
 */
export const StringSpliceIndexTransformationFunction: ReferenceTransformationFunction =
  (o: StringSpliceOperation, r: ModelReferenceData) => {
    const values: number[] = IndexTransformer.handleSplice(r.values, o.index, o.deleteCount, o.insertValue.length);
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

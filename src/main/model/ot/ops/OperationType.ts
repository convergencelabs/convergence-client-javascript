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

const types: {[key: string]: string}  = {
  COMPOUND: "Compound",
  ARRAY_INSERT: "ArrayInsert",
  ARRAY_REORDER: "ArrayReorder",
  ARRAY_REMOVE: "ArrayRemove",
  ARRAY_SET: "ArraySet",
  ARRAY_VALUE: "ArrayValue",
  BOOLEAN_VALUE: "BooleanValue",
  NUMBER_DELTA: "NumberDelta",
  NUMBER_VALUE: "NumberValue",
  OBJECT_ADD: "ObjectAdd",
  OBJECT_REMOVE: "ObjectRemove",
  OBJECT_SET: "ObjectSet",
  OBJECT_VALUE: "ObjectValue",
  STRING_INSERT: "StringInsert",
  STRING_REMOVE: "StringRemove",
  STRING_VALUE: "StringValue",
  DATE_VALUE: "DateValue"
};

Object.freeze(types);

/**
 * @hidden
 * @internal
 */
export const OperationType: any = types;

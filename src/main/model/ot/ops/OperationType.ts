/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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

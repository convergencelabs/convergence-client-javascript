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

import {IDataValue} from "../../model/";

/**
 * @module Offline
 */
export interface IServerOperationData {
  modelId: string;
  sessionId: string;
  version: number;
  timestamp: Date;
  operation: IModelOperationData;
}

/**
 * @module Offline
 */
export interface ILocalOperationData {
  modelId: string;
  sessionId: string;
  contextVersion: number;
  sequenceNumber: number;
  timestamp: Date;
  operation: IModelOperationData;
}

/**
 * @module Offline
 */
export interface IModelOperationData {
  type: "string_splice" | "string_set" |
    "array_insert" | "array_remove" | "array_replace" | "array_move" | "array_set" |
    "object_set_property" | "object_add_property" | "object_remove_property" | "object_set" |
    "number_delta" | "number_set" |
    "boolean_set" |
    "date_set" |
    "compound";
}

/**
 * @hidden
 * @internal
 */
export interface ICompoundOperationData extends IModelOperationData {
  type: "compound";
  ops: IModelDiscreteOperationData[];
}

/**
 * @hidden
 * @internal
 */
export interface IModelDiscreteOperationData extends IModelOperationData {
  id: string;
  noOp: boolean;
  type: "string_splice" | "string_set" |
    "array_insert" | "array_remove" | "array_replace" | "array_move" | "array_set" |
    "object_set_property" | "object_add_property" | "object_remove_property" | "object_set" |
    "number_delta" | "number_set" |
    "boolean_set" |
    "date_set";
}

//
// String Operations
//

/**
 * @hidden
 * @internal
 */
export interface IStringSpliceOperationData extends IModelDiscreteOperationData {
  type: "string_splice";
  index: number;
  deleteCount: number;
  insertedValue: string;
}

/**
 * @hidden
 * @internal
 */
export interface IStringSetOperationData extends IModelDiscreteOperationData {
  type: "string_set";
  value: string;
}

//
// Array Operations
//

/**
 * @hidden
 * @internal
 */
export interface IArrayInsertOperationData extends IModelDiscreteOperationData {
  type: "array_insert";
  index: number;
  value: IDataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IArrayReplaceOperationData extends IModelDiscreteOperationData {
  type: "array_replace";
  index: number;
  value: IDataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IArrayRemoveOperationData extends IModelDiscreteOperationData {
  type: "array_remove";
  index: number;
}

/**
 * @hidden
 * @internal
 */
export interface IArrayMoveOperationData extends IModelDiscreteOperationData {
  type: "array_move";
  fromIndex: number;
  toIndex: number;
}

/**
 * @hidden
 * @internal
 */
export interface IArraySetOperationData extends IModelDiscreteOperationData {
  type: "array_set";
  value: IDataValue[];
}

//
// Object Operations
//

/**
 * @hidden
 * @internal
 */
export interface IObjectAddPropertyOperationData extends IModelDiscreteOperationData {
  type: "object_add_property";
  key: string;
  value: IDataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IObjectSetPropertyOperationData extends IModelDiscreteOperationData {
  type: "object_set_property";
  key: string;
  value: IDataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IObjectRemovePropertyOperationData extends IModelDiscreteOperationData {
  type: "object_remove_property";
  key: string;
}

/**
 * @hidden
 * @internal
 */
export interface IObjectSetOperationData extends IModelDiscreteOperationData {
  type: "object_set";
  value: {[key: string]: IDataValue};
}

//
// Number Operations
//

/**
 * @hidden
 * @internal
 */
export interface INumberDeltaOperationData extends IModelDiscreteOperationData {
  type: "number_delta";
  value: number;
}

/**
 * @hidden
 * @internal
 */
export interface INumberSetOperationData extends IModelDiscreteOperationData {
  type: "number_set";
  value: number;
}

//
// Boolean Operations
//

/**
 * @hidden
 * @internal
 */
export interface IBooleanSetOperationData extends IModelDiscreteOperationData {
  type: "boolean_set";
  value: boolean;
}

//
// Date Operations
//

/**
 * @hidden
 * @internal
 */
export interface IDateSetOperationData extends IModelDiscreteOperationData {
  type: "date_set";
  value: Date;
}

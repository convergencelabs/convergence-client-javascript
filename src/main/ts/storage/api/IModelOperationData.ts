import {DataValue} from "../../model/dataValue";

/**
 * @hidden
 * @internal
 */
export interface IServerOperationData {
  modelId: string;
  version: number;
  timestamp: Date;
  operation: IModelOperationData;
}

/**
 * @hidden
 * @internal
 */
export interface ILocalOperationData {
  modelId: string;
  contextVersion: number;
  sequenceNumber: number;
  timestamp: Date;
  operation: IModelOperationData;
}

/**
 * @hidden
 * @internal
 */
export interface IModelOperationData {
  type: "string_insert" | "string_remove" | "string_set" |
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
  type: "string_insert" | "string_remove" | "string_set" |
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
export interface IStringInsertOperationData extends IModelDiscreteOperationData {
  type: "string_insert";
  index: number;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface IStringRemoveOperationData extends IModelDiscreteOperationData {
  type: "string_remove";
  index: number;
  value: string;
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
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IArrayReplaceOperationData extends IModelDiscreteOperationData {
  type: "array_replace";
  index: number;
  value: DataValue;
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
  value: DataValue[];
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
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface IObjectSetPropertyOperationData extends IModelDiscreteOperationData {
  type: "object_set_property";
  key: string;
  value: DataValue;
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
  value: {[key: string]: DataValue};
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

import {DataValue} from "../../model/dataValue";

export interface IServerOperationData {
  modelId: string;
  version: number;
  operation: IModelOperationData;
}

export interface ILocalOperationData {
  modelId: string;
  contextVersion: number;
  sequenceNumber: number;
  operation: IModelOperationData;
}

export interface IModelOperationData {
  type: "string_insert" | "string_remove" | "string_set" |
    "array_insert" | "array_remove" | "array_replace" | "array_move" | "array_set" |
    "object_set_property" | "object_add_property" | "object_remove_property" | "object_set" |
    "number_delta" | "number_set" |
    "boolean_set" |
    "date_set" |
    "compound";
}

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
export interface IStringInsertOperationData extends IModelDiscreteOperationData {
  type: "string_insert";
  index: number;
  value: string;
}

export interface IStringRemoveOperationData extends IModelDiscreteOperationData {
  type: "string_remove";
  index: number;
  value: string;
}

export interface IStringSetOperationData extends IModelDiscreteOperationData {
  type: "string_remove";
  value: string;
}

//
// Array Operations
//
export interface IArrayInsertOperationData extends IModelDiscreteOperationData {
  type: "array_set";
  index: number;
  value: DataValue;
}

export interface IArrayReplaceOperationData extends IModelDiscreteOperationData {
  type: "array_replace";
  index: number;
  value: DataValue;
}

export interface IArrayRemoveOperationData extends IModelDiscreteOperationData {
  type: "array_remove";
  index: number;
}

export interface IArrayMoveOperationData extends IModelDiscreteOperationData {
  type: "array_replace";
  fromIndex: number;
  toIndex: number;
}

export interface IArraySetOperationData extends IModelDiscreteOperationData {
  type: "array_set";
  value: DataValue[];
}

//
// Object Operations
//
export interface IObjectAddPropertyOperationData extends IModelDiscreteOperationData {
  type: "object_add_property";
  key: string;
  value: DataValue;
}

export interface IObjectSetPropertyOperationData extends IModelDiscreteOperationData {
  type: "object_set_property";
  key: string;
  value: DataValue;
}

export interface IObjectRemovePropertyOperationData extends IModelDiscreteOperationData {
  type: "object_remove_property";
  key: string;
}

export interface IObjectSetOperationData extends IModelDiscreteOperationData {
  type: "object_set";
  value: {[key: string]: DataValue};
}

//
// Number Operations
//
export interface INumberDeltaOperationData extends IModelDiscreteOperationData {
  type: "number_delta";
  value: number;
}

export interface INumberSetOperationData extends IModelDiscreteOperationData {
  type: "number_set";
  value: number;
}

//
// Boolean Operations
//
export interface IBooleanSetOperationData extends IModelDiscreteOperationData {
  type: "boolean_set";
  value: boolean;
}

//
// Date Operations
//
export interface IDateSetOperationData extends IModelDiscreteOperationData {
  type: "date_set";
  value: Date;
}

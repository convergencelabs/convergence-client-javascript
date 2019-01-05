import {io} from "@convergence/convergence-proto";
import IDataValue = io.convergence.proto.IDataValue;
import {
  ArrayValue,
  BooleanValue,
  DataValue,
  DateValue,
  NullValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from "./dataValue";
import {
  dateToTimestamp,
  getOrDefaultArray,
  getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultObject, getOrDefaultString,
  protoValueToJson,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import {mapObjectValues} from "../util/ObjectUtils";
import IObjectValue = io.convergence.proto.IObjectValue;
import {ModelPermissions} from "./ModelPermissions";
import IModelPermissionsData = io.convergence.proto.IModelPermissionsData;
import {ModelResult} from "./query";
import IModelResult = io.convergence.proto.IModelResult;

export function toDataValue(val: IDataValue): DataValue {
  if (val.arrayValue) {
    const {id, children} = val.arrayValue;
    return {
      type: "array",
      id,
      children: getOrDefaultArray(children).map(toDataValue)
    } as ArrayValue;
  } else if (val.objectValue) {
    return toObjectValue(val.objectValue);
  } else if (val.booleanValue) {
    const {id, value} = val.booleanValue;
    return {type: "boolean", id, value: getOrDefaultBoolean(value)} as BooleanValue;
  } else if (val.dateValue) {
    const {id, value} = val.dateValue;
    return {type: "date", id, value: timestampToDate(value)} as DateValue;
  } else if (val.doubleValue) {
    const {id, value} = val.doubleValue;
    return {type: "number", id, value: getOrDefaultNumber(value)} as NumberValue;
  } else if (val.stringValue) {
    const {id, value} = val.stringValue;
    return {type: "string", id, value: getOrDefaultString(value)} as StringValue;
  } else if (val.nullValue) {
    const {id} = val.nullValue;
    return {type: "null", id, value: null} as NullValue;
  } else {
    throw new ConvergenceError("Invalid data value type: " + JSON.stringify(val));
  }
}

export function toIDataValue(val: DataValue): IDataValue {
  if (val.type === "array") {
    const {id, children} = val as ArrayValue;
    return {arrayValue: {id, children: children.map(toIDataValue)}};
  } else if (val.type === "object") {
    const {id, children} = val as ObjectValue;
    return {objectValue: {id, children: mapObjectValues(children, toIDataValue)}};
  } else if (val.type === "boolean") {
    const {id, value} = val as BooleanValue;
    return {booleanValue: {id, value}};
  } else if (val.type === "date") {
    const {id, value} = val as DateValue;
    return {dateValue: {id, value: dateToTimestamp(value)}};
  } else if (val.type === "number") {
    const {id, value} = val as NumberValue;
    return {doubleValue: {id, value}};
  } else if (val.type === "null") {
    const {id} = val as NullValue;
    return {nullValue: {id}};
  } else if (val.type === "string") {
    const {id, value} = val as StringValue;
    return {stringValue: {id, value}};
  } else {
    throw new ConvergenceError("Invalid data value type: " + JSON.stringify(val));
  }
}

export function toIObjectValue(objectValue: ObjectValue): IObjectValue {
  return {
    id: objectValue.id,
    children: mapObjectValues(objectValue.children, toIDataValue)
  };
}

export function toObjectValue(objectValue: IObjectValue): ObjectValue {
  return {
    type: "object",
    id: objectValue.id,
    children: mapObjectValues(getOrDefaultObject(objectValue.children), toDataValue)
  };
}

export function toModelPermissions(permissionsData: IModelPermissionsData): ModelPermissions | undefined {
  return permissionsData === undefined ?
    undefined :
    new ModelPermissions(
      getOrDefaultBoolean(permissionsData.read),
      getOrDefaultBoolean(permissionsData.write),
      getOrDefaultBoolean(permissionsData.remove),
      getOrDefaultBoolean(permissionsData.manage));
}

export function toModelResult(result: IModelResult): ModelResult {
  return new ModelResult(
    mapObjectValues(result.data.fields, protoValueToJson),
    result.collectionId,
    result.modelId,
    timestampToDate(result.createdTime),
    timestampToDate(result.modifiedTime),
    getOrDefaultNumber(result.version)
  );
}

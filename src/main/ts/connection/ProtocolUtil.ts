import {google} from "@convergence/convergence-proto";
import ITimestamp = google.protobuf.ITimestamp;
import IValue = google.protobuf.IValue;
import {mapObjectValues} from "../util/ObjectUtils";
import {ConvergenceError} from "../util";

/**
 * @hidden
 * @internal
 */
export function getOrDefaultNumber(val?: number | Long): number {
  return (val as number) || 0;
}

/**
 * @hidden
 * @internal
 */
export function getOrDefaultBoolean(val?: boolean): boolean {
  return val || false;
}

/**
 * @hidden
 * @internal
 */
export function getOrDefaultString(val?: string): string {
  return val || "";
}

/**
 * @hidden
 * @internal
 */
export function getOrDefaultArray<T>(val?: T[]): T[] {
  return val || [];
}

/**
 * @hidden
 * @internal
 */
export function getOrDefaultObject<T>(val: { [key: string]: T }): { [key: string]: T } {
  return val || {};
}

/**
 * @hidden
 * @internal
 */
export function toOptional<T>(value?: T): { value: T | null } | null {
  if (value === undefined) {
    return null;
  } else {
    return {value};
  }
}

/**
 * @hidden
 * @internal
 */
export function fromOptional<T>(optional?: { value?: T | null } | null): T | null {
  if (optional) {
    return optional.value;
  } else {
    return null;
  }
}

/**
 * @hidden
 * @internal
 */
export function timestampToDate(timestamp: ITimestamp): Date {
  const seconds = timestamp.seconds as number;
  const nanos = timestamp.nanos as number;
  const nanosAsMillis = Math.round(nanos / 1000000);
  const millis = (seconds * 1000) + nanosAsMillis;
  return new Date(millis);
}

/**
 * @hidden
 * @internal
 */
export function dateToTimestamp(date: Date): ITimestamp {
  const millis = date.getTime();
  const seconds = Math.floor(millis / 1000);
  const nanos = (millis - (seconds * 1000)) * 1000000;
  return {seconds, nanos};
}

/**
 * @hidden
 * @internal
 */
export function protoValueToJson(value: IValue): any {
  if (value.nullValue) {
    return null;
  } else if (value.boolValue) {
    return getOrDefaultBoolean(value.boolValue);
  } else if (value.stringValue) {
    return getOrDefaultString(value.stringValue);
  } else if (value.numberValue) {
    return getOrDefaultNumber(value.numberValue);
  } else if (value.structValue) {
    return mapObjectValues(getOrDefaultObject(value.structValue.fields), protoValueToJson);
  } else if (value.listValue) {
    return getOrDefaultArray(value.listValue.values).map(protoValueToJson);
  } else {
    throw new ConvergenceError("Can not deserialize unknown data type: " + value);
  }
}

/**
 * @hidden
 * @internal
 */
export function jsonToProtoValue(value: any): IValue {
  if (value === null) {
    return {nullValue: null};
  } else if (typeof value === "boolean") {
    return {boolValue: value};
  } else if (typeof value === "string") {
    return {stringValue: value};
  } else if (typeof value === "number") {
    return {numberValue: value};
  } else if (Array.isArray(value)) {
    return {listValue: {values: value.map(jsonToProtoValue)}};
  } else if (value !== undefined && value.constructor === Object) {
    return {structValue: {fields: mapObjectValues(value, jsonToProtoValue)}};
  } else {
    throw new ConvergenceError("Can not serialize unknown data type: " + value);
  }
}

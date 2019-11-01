import {google, io} from "@convergence/convergence-proto";
import ITimestamp = google.protobuf.ITimestamp;
import IValue = google.protobuf.IValue;
import {mapObjectValues} from "../util/ObjectUtils";
import {ConvergenceError} from "../util";
import IDomainUserIdData = io.convergence.proto.IDomainUserIdData;
import {DomainUserId, DomainUserType} from "../identity/DomainUserId";
import DomainUserTypeData = io.convergence.proto.DomainUserTypeData;
import * as Long from "long";

/**
 * @hidden
 * @internal
 */
export function getOrDefaultNumber(val?: number | Long): number {
  if (val === null || val === undefined) {
    return 0;
  } else if (typeof val === "number") {
    return val;
  } else {
    return val.toNumber();
  }
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
  const seconds = getOrDefaultNumber(timestamp.seconds);
  const nanos = getOrDefaultNumber(timestamp.nanos);
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
  if (typeof value.nullValue !== "undefined") {
    return null;
  } else if (typeof value.boolValue !== "undefined") {
    return getOrDefaultBoolean(value.boolValue);
  } else if (typeof value.stringValue !== "undefined") {
    return getOrDefaultString(value.stringValue);
  } else if (typeof value.numberValue !== "undefined") {
    return getOrDefaultNumber(value.numberValue);
  } else if (typeof value.structValue !== "undefined") {
    return mapObjectValues(getOrDefaultObject(value.structValue.fields), protoValueToJson);
  } else if (typeof value.listValue !== "undefined") {
    return getOrDefaultArray(value.listValue.values).map(protoValueToJson);
  } else {
    throw new ConvergenceError("Could not deserialize json value: " + JSON.stringify(value));
  }
}

/**
 * @hidden
 * @internal
 */
export function jsonToProtoValue(value: any): IValue {
  if (value === null) {
    return {nullValue: 0};
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

/**
 * @hidden
 * @internal
 */
export function protoToDomainUserId(data: IDomainUserIdData): DomainUserId {
  return new DomainUserId(protoToDomainUserType(data.userType), getOrDefaultString(data.username));
}

/**
 * @hidden
 * @internal
 */
export function domainUserIdToProto(domainUserId: DomainUserId): IDomainUserIdData {
  return {userType: domainUserTypeToProto(domainUserId.userType), username: domainUserId.username};
}

/**
 * @hidden
 * @internal
 */
export function protoToDomainUserType(data: DomainUserTypeData): DomainUserType {
  switch (data) {
    case 0:
    case undefined:
      return DomainUserType.NORMAL;
    case 1:
      return DomainUserType.CONVERGENCE;
    case 2:
      return DomainUserType.ANONYMOUS;
  }
}

/**
 * @hidden
 * @internal
 */
export function domainUserTypeToProto(type: DomainUserType): DomainUserTypeData {
  switch (type) {
    case DomainUserType.NORMAL:
      return 0;
    case DomainUserType.CONVERGENCE:
      return 1;
    case DomainUserType.ANONYMOUS:
      return 2;
  }
}

import {google} from "@convergence/convergence-proto";
import ITimestamp = google.protobuf.ITimestamp;
import IValue = google.protobuf.IValue;
import {mapObjectValues} from "../util/ObjectUtils";


export function toOptional<T>(value?: T): { value: T | null } | null {
  if (value === undefined) {
    return null;
  } else {
    return {value};
  }
}

export function fromOptional<T>(optional?: { value?: T | null } | null): T | null {
  if (optional) {
    return optional.value;
  } else {
    return null;
  }
}

export function timestampToDate(timestamp: ITimestamp): Date {
  const seconds = timestamp.seconds as number;
  const nanos = timestamp.nanos as number;
  const nanosAsMillis = Math.round(nanos / 1000000);
  const millis = (seconds * 1000) + nanosAsMillis;
  return new Date(millis);
}

export function dateToTimestamp(date: Date): ITimestamp {
  const millis = date.getTime();
  const seconds = Math.floor(millis / 1000);
  const nanos = (millis - (seconds * 1000)) * 1000000;
  return {seconds, nanos};
}

export function protoValueToJson(value: IValue): any {
  if (value.nullValue) {
    return null;
  } else if (value.boolValue) {
    return value.boolValue;
  } else if (value.stringValue) {
    return value.stringValue;
  } else if (value.numberValue) {
    return value.numberValue;
  } else if (value.structValue) {
    return mapObjectValues(value.structValue.fields, protoValueToJson);
  } else if (value.listValue) {
    return value.listValue.values.map(protoValueToJson);
  } else {
    return;
  }
}

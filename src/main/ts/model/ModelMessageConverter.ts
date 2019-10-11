import {io} from "@convergence-internal/convergence-proto";
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
  dateToTimestamp, domainUserIdToProto,
  getOrDefaultArray,
  getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultObject, getOrDefaultString,
  protoValueToJson,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import {mapObjectValues, objectForEach} from "../util/ObjectUtils";
import IObjectValue = io.convergence.proto.IObjectValue;
import {ModelPermissions} from "./ModelPermissions";
import IModelPermissionsData = io.convergence.proto.IModelPermissionsData;
import {ModelResult} from "./query";
import IModelResult = io.convergence.proto.IModelResult;
import {DomainUserId} from "../identity/DomainUserId";
import IUserModelPermissionsEntry = io.convergence.proto.IUserModelPermissionsEntry;
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;

import IModelForceCloseMessage = io.convergence.proto.IModelForceCloseMessage;
import IRemoteOperationMessage = io.convergence.proto.IRemoteOperationMessage;
import IRemoteReferenceSharedMessage = io.convergence.proto.IRemoteReferenceSharedMessage;
import IRemoteReferenceUnsharedMessage = io.convergence.proto.IRemoteReferenceUnsharedMessage;
import IRemoteReferenceSetMessage = io.convergence.proto.IRemoteReferenceSetMessage;
import IRemoteReferenceClearedMessage = io.convergence.proto.IRemoteReferenceClearedMessage;
import IOperationAcknowledgementMessage = io.convergence.proto.IOperationAcknowledgementMessage;
import IRemoteClientOpenedMessage = io.convergence.proto.IRemoteClientOpenedMessage;
import IRemoteClientClosedMessage = io.convergence.proto.IRemoteClientClosedMessage;
import IModelPermissionsChangedMessage = io.convergence.proto.IModelPermissionsChangedMessage;
import IModelReconnectCompleteMessage = io.convergence.proto.IModelReconnectCompleteMessage;

/**
 * @hidden
 * @internal
 */
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
    throw new ConvergenceError("Invalid data delta type: " + JSON.stringify(val));
  }
}

/**
 * @hidden
 * @internal
 */
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
    throw new ConvergenceError("Invalid data delta type: " + JSON.stringify(val));
  }
}

/**
 * @hidden
 * @internal
 */
export function toIObjectValue(objectValue: ObjectValue): IObjectValue {
  return {
    id: objectValue.id,
    children: mapObjectValues(objectValue.children, toIDataValue)
  };
}

/**
 * @hidden
 * @internal
 */
export function toObjectValue(objectValue: IObjectValue): ObjectValue {
  return {
    type: "object",
    id: objectValue.id,
    children: mapObjectValues(getOrDefaultObject(objectValue.children), toDataValue)
  };
}

/**
 * @hidden
 * @internal
 */
export function toModelPermissions(permissionsData: IModelPermissionsData): ModelPermissions | undefined {
  return permissionsData === undefined ?
    undefined :
    new ModelPermissions(
      getOrDefaultBoolean(permissionsData.read),
      getOrDefaultBoolean(permissionsData.write),
      getOrDefaultBoolean(permissionsData.remove),
      getOrDefaultBoolean(permissionsData.manage));
}

/**
 * @hidden
 * @internal
 */
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

/**
 * @hidden
 * @internal
 */
export function modelUserPermissionMapToProto(
  perms: { [key: string]: ModelPermissions } | undefined): IUserModelPermissionsEntry[] {
  if (perms === undefined || perms === null) {
    return [];
  } else {
    const mapped: IUserModelPermissionsEntry[] = [];
    objectForEach(perms, (username, permissions) => {
      mapped.push({
        user: domainUserIdToProto(DomainUserId.normal(username)),
        permissions
      });
    });
    return mapped;
  }
}

/**
 * @hidden
 * @internal
 */
export function protoToModelUserPermissionMap(perms: IUserModelPermissionsEntry[]): Map<string, ModelPermissions> {
  const map = new Map();
  if (perms !== undefined || perms !== null) {
    perms.forEach(entry => {
      map.set(entry.user.username, toModelPermissions(entry.permissions));
    });
  }
  return map;
}

/**
 * @hidden
 * @internal
 */
export function getModelMessageResourceId(message: IConvergenceMessage): string {
  const modelMessage = toModelMessage(message);
  return modelMessage ? modelMessage.resourceId : null;
}

type ModelMessage =
  IModelForceCloseMessage |
  IRemoteOperationMessage |
  IRemoteReferenceSharedMessage |
  IRemoteReferenceUnsharedMessage  |
  IRemoteReferenceSetMessage |
  IRemoteReferenceClearedMessage |
  IOperationAcknowledgementMessage |
  IRemoteClientOpenedMessage |
  IRemoteClientClosedMessage |
  IModelPermissionsChangedMessage |
  IModelReconnectCompleteMessage;

function toModelMessage(message: IConvergenceMessage): ModelMessage {
  return message.forceCloseRealTimeModel ||
    message.remoteOperation ||
    message.referenceShared ||
    message.referenceSet ||
    message.referenceCleared ||
    message.referenceUnshared ||
    message.operationAck ||
    message.remoteClientOpenedModel ||
    message.remoteClientClosedModel ||
    message.modelPermissionsChanged ||
    message.modelReconnectComplete;
}

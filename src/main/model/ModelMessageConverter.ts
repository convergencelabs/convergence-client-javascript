/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

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
  domainUserIdToProto,
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  getOrDefaultObject,
  getOrDefaultString,
  protoValueToJson,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import {mapObjectValues, objectForEach} from "../util/ObjectUtils";
import {ModelPermissions} from "./ModelPermissions";
import {DomainUserId} from "../identity";
import {ModelResult} from "./query";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IDataValue = com.convergencelabs.convergence.proto.model.IDataValue;
import IObjectValue = com.convergencelabs.convergence.proto.model.IObjectValue;
import IModelPermissionsData = com.convergencelabs.convergence.proto.model.IModelPermissionsData;
import IModelResult = com.convergencelabs.convergence.proto.model.ModelsQueryResponseMessage.IModelResult;
import IUserModelPermissionsData = com.convergencelabs.convergence.proto.model.IUserModelPermissionsData;
import IModelForceCloseMessage = com.convergencelabs.convergence.proto.model.IModelForceCloseMessage;
import IRemoteOperationMessage = com.convergencelabs.convergence.proto.model.IRemoteOperationMessage;
import IRemoteReferenceSharedMessage = com.convergencelabs.convergence.proto.model.IRemoteReferenceSharedMessage;
import IRemoteReferenceUnsharedMessage = com.convergencelabs.convergence.proto.model.IRemoteReferenceUnsharedMessage;
import IRemoteReferenceSetMessage = com.convergencelabs.convergence.proto.model.IRemoteReferenceSetMessage;
import IRemoteReferenceClearedMessage = com.convergencelabs.convergence.proto.model.IRemoteReferenceClearedMessage;
import IOperationAcknowledgementMessage = com.convergencelabs.convergence.proto.model.IOperationAcknowledgementMessage;
import IRemoteClientOpenedMessage = com.convergencelabs.convergence.proto.model.IRemoteClientOpenedMessage;
import IRemoteClientClosedMessage = com.convergencelabs.convergence.proto.model.IRemoteClientClosedMessage;
import IModelPermissionsChangedMessage = com.convergencelabs.convergence.proto.model.IModelPermissionsChangedMessage;
import IRemoteClientResyncStartedMessage =
  com.convergencelabs.convergence.proto.model.IRemoteClientResyncStartedMessage;
import IRemoteClientResyncCompletedMessage =
  com.convergencelabs.convergence.proto.model.IRemoteClientResyncCompletedMessage;
import {TypeChecker} from "../util/TypeChecker";

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
  perms: { [key: string]: ModelPermissions } | undefined): IUserModelPermissionsData[] {
  if (perms === undefined || perms === null) {
    return [];
  } else {
    const mapped: IUserModelPermissionsData[] = [];
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
export function protoToModelUserPermissionMap(perms: IUserModelPermissionsData[]): Map<string, ModelPermissions> {
  const map = new Map();
  if (TypeChecker.isArray(perms)) {
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
  IRemoteReferenceUnsharedMessage |
  IRemoteReferenceSetMessage |
  IRemoteReferenceClearedMessage |
  IOperationAcknowledgementMessage |
  IRemoteClientOpenedMessage |
  IRemoteClientClosedMessage |
  IModelPermissionsChangedMessage |
  IRemoteClientResyncStartedMessage |
  IRemoteClientResyncCompletedMessage;

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
    message.remoteClientResyncStarted ||
    message.remoteClientResyncCompleted;
}

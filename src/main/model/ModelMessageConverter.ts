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

import {
  IArrayValue,
  IBooleanValue,
  IDataValue,
  IDateValue,
  INullValue,
  INumberValue,
  IObjectValue,
  IStringValue,
} from "./dataValue";
import {
  dateToTimestamp,
  domainUserIdToProto,
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  getOrDefaultObject,
  getOrDefaultString,
  protoToDomainUserId,
  protoValueToJson,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import {mapObjectValues, objectForEach} from "../util/ObjectUtils";
import {ModelPermissions} from "./ModelPermissions";
import {DomainUserId, DomainUserIdMap} from "../identity";
import {ModelResult} from "./query";
import {TypeChecker} from "../util/TypeChecker";

import {com} from "@convergence/convergence-proto";
import {IModelPermissions} from "./IModelPermissions";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IDataValueData = com.convergencelabs.convergence.proto.model.IDataValue;
import IObjectValueData = com.convergencelabs.convergence.proto.model.IObjectValue;
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
import IModelResyncServerCompleteMessage =
  com.convergencelabs.convergence.proto.model.IModelResyncServerCompleteMessage;

/**
 * @hidden
 * @internal
 */
export function toDataValue(val: IDataValueData): IDataValue {
  if (val.arrayValue) {
    const {id, children} = val.arrayValue;
    return {
      type: "array",
      id,
      value: getOrDefaultArray(children).map(toDataValue)
    } as IArrayValue;
  } else if (val.objectValue) {
    return toObjectValue(val.objectValue);
  } else if (val.booleanValue) {
    const {id, value} = val.booleanValue;
    return {type: "boolean", id, value: getOrDefaultBoolean(value)} as IBooleanValue;
  } else if (val.dateValue) {
    const {id, value} = val.dateValue;
    return {type: "date", id, value: timestampToDate(value)} as IDateValue;
  } else if (val.doubleValue) {
    const {id, value} = val.doubleValue;
    return {type: "number", id, value: getOrDefaultNumber(value)} as INumberValue;
  } else if (val.stringValue) {
    const {id, value} = val.stringValue;
    return {type: "string", id, value: getOrDefaultString(value)} as IStringValue;
  } else if (val.nullValue) {
    const {id} = val.nullValue;
    return {type: "null", id, value: null} as INullValue;
  } else {
    throw new ConvergenceError("Invalid data delta type: " + JSON.stringify(val));
  }
}

/**
 * @hidden
 * @internal
 */
export function toIDataValue(val: IDataValue): IDataValueData {
  if (val.type === "array") {
    const {id, value} = val as IArrayValue;
    return {arrayValue: {id, children: value.map(toIDataValue)}};
  } else if (val.type === "object") {
    const {id, value} = val as IObjectValue;
    return {objectValue: {id, children: mapObjectValues(value, toIDataValue)}};
  } else if (val.type === "boolean") {
    const {id, value} = val as IBooleanValue;
    return {booleanValue: {id, value}};
  } else if (val.type === "date") {
    const {id, value} = val as IDateValue;
    return {dateValue: {id, value: dateToTimestamp(value)}};
  } else if (val.type === "number") {
    const {id, value} = val as INumberValue;
    return {doubleValue: {id, value}};
  } else if (val.type === "null") {
    const {id} = val as INullValue;
    return {nullValue: {id}};
  } else if (val.type === "string") {
    const {id, value} = val as IStringValue;
    return {stringValue: {id, value}};
  } else {
    throw new ConvergenceError("Invalid data delta type: " + JSON.stringify(val));
  }
}

/**
 * @hidden
 * @internal
 */
export function toIObjectValue(objectValue: IObjectValue): IObjectValueData {
  return {
    id: objectValue.id,
    children: mapObjectValues(objectValue.value, toIDataValue)
  };
}

/**
 * @hidden
 * @internal
 */
export function toObjectValue(objectValue: IObjectValueData): IObjectValue {
  return {
    type: "object",
    id: objectValue.id,
    value: mapObjectValues(getOrDefaultObject(objectValue.children), toDataValue)
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
  const fields = getOrDefaultObject(result.data.fields);
  return new ModelResult(
    mapObjectValues(fields, protoValueToJson),
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
  perms: { [key: string]: IModelPermissions } | undefined): IUserModelPermissionsData[] {
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
export function protoToModelUserPermissionMap(perms: IUserModelPermissionsData[]): DomainUserIdMap<ModelPermissions> {
  const map = new DomainUserIdMap<ModelPermissions>();
  if (TypeChecker.isArray(perms)) {
    perms.forEach(entry => {
      const domainUserId = protoToDomainUserId(entry.user);
      map.set(domainUserId, toModelPermissions(entry.permissions));
    });
  }
  return map;
}

/**
 * @hidden
 * @internal
 */
export function getModelMessageResourceId(message: IConvergenceMessage): number {
  const modelMessage = toModelMessage(message);
  return modelMessage !== null ? getOrDefaultNumber(modelMessage.resourceId) : null;
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
  IRemoteClientResyncCompletedMessage |
  IModelResyncServerCompleteMessage;

function toModelMessage(message: IConvergenceMessage): ModelMessage | null {
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
    message.remoteClientResyncCompleted ||
    message.modelResyncServerComplete ||
    null;
}

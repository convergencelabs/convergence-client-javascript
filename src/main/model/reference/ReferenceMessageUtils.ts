/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {fromOptional, getOrDefaultArray, getOrDefaultNumber, getOrDefaultString} from "../../connection/ProtocolUtil";
import {ReferenceType} from "./ReferenceType";
import {
  RemoteReferenceCleared,
  RemoteReferenceEvent,
  RemoteReferenceSet,
  RemoteReferenceShared,
  RemoteReferenceUnshared
} from "./RemoteReferenceEvent";
import {ModelReference} from "./ModelReference";
import {RealTimeElement} from "../rt";
import {IndexRange} from "./RangeReference";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IReferenceValues = com.convergencelabs.convergence.proto.model.IReferenceValues;

/**
 * @hidden
 * @internal
 */
export function toRemoteReferenceEvent(message: IConvergenceMessage): RemoteReferenceEvent {
  if (message.referenceShared) {
    const {sessionId, key, references, valueId, resourceId} = message.referenceShared;
    const {referenceType, values} = extractValueAndType(references);
    return new RemoteReferenceShared(
      sessionId,
      resourceId,
      fromOptional(valueId),
      key,
      referenceType,
      values
    );
  } else if (message.referenceSet) {
    const {sessionId, key, references, valueId, resourceId} = message.referenceSet;
    const {values} = extractValueAndType(references);
    return new RemoteReferenceSet(
      sessionId,
      resourceId,
      fromOptional(valueId),
      key,
      values
    );
  } else if (message.referenceCleared) {
    const {sessionId, key, valueId, resourceId} = message.referenceCleared;
    return new RemoteReferenceCleared(
      sessionId,
      resourceId,
      fromOptional(valueId),
      key
    );
  } else if (message.referenceUnshared) {
    const {sessionId, key, valueId, resourceId} = message.referenceUnshared;
    return new RemoteReferenceUnshared(
      sessionId,
      resourceId,
      fromOptional(valueId),
      key
    );
  }
}

interface ValueAndType {
  referenceType: ReferenceType;
  values: any[];
}

/**
 * @hidden
 * @internal
 */
export function extractValueAndType(values: IReferenceValues): ValueAndType {
  if (values.indices) {
    const vals = getOrDefaultArray(values.indices.values);
    return {referenceType: "index", values: vals.map(getOrDefaultNumber)};
  } else if (values.ranges) {
    const ranges = getOrDefaultArray(values.ranges.values);
    const val = ranges.map(({startIndex, endIndex}) => {
      return {start: getOrDefaultNumber(startIndex), end: getOrDefaultNumber(endIndex)};
    });
    return {referenceType: "range", values: val};
  } else if (values.properties) {
    const vals = getOrDefaultArray(values.properties.values);
    return {referenceType: "property", values: vals.map(getOrDefaultString)};
  } else if (values.elements) {
    const vals = getOrDefaultArray(values.elements.values);
    return {referenceType: "element", values: vals.map(getOrDefaultString)};
  }
}

/**
 * @hidden
 * @internal
 */
export function toIReferenceValues(type: ReferenceType, values: any[]): IReferenceValues {
  switch (type) {
    case ModelReference.Types.INDEX:
      return {indices: {values}};
    case ModelReference.Types.PROPERTY:
      return {properties: {values}};
    case ModelReference.Types.RANGE:
      const ranges = values.map((r: IndexRange) => {
        return {startIndex: r.start, endIndex: r.end};
      });
      return {ranges: {values: ranges}};
    case ModelReference.Types.ELEMENT:
      const elementIds: string[] = [];
      for (const element of values) {
        elementIds.push((element as RealTimeElement<any>).id());
      }
      return {elements: {values: elementIds}};
    default:
      throw new Error("Invalid reference type");
  }
}

import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {fromOptional} from "../../connection/ProtocolUtil";
import IReferenceValues = io.convergence.proto.IReferenceValues;
import {ReferenceType} from "./ReferenceType";
import {
  RemoteReferenceCleared,
  RemoteReferenceEvent,
  RemoteReferenceSet,
  RemoteReferenceShared, RemoteReferenceUnshared
} from "./RemoteReferenceEvent";
import {ModelReference} from "./ModelReference";
import {RealTimeElement} from "../rt";
import {IndexRange} from "./RangeReference";

export function isReferenceMessage(message: IConvergenceMessage): boolean {
  return !!(message.referenceShared || message.referenceSet ||
    message.referenceCleared || message.referenceUnshared);
}

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
      key,
      fromOptional(valueId),
      values
    );
  } else if (message.referenceCleared) {
    const {sessionId, key, valueId, resourceId} = message.referenceCleared;
    return new RemoteReferenceCleared(
      sessionId,
      resourceId,
      key,
      fromOptional(valueId)
    );
  } else if (message.referenceUnshared) {
    const {sessionId, key, valueId, resourceId} = message.referenceUnshared;
    return new RemoteReferenceUnshared(
      sessionId,
      resourceId,
      key,
      fromOptional(valueId)
    );
  }
}

interface ValueAndType {
  referenceType: ReferenceType;
  values: any[];
}

export function extractValueAndType(values: IReferenceValues): ValueAndType {
  if (values.indices) {
    return {referenceType: "index", values: values.indices.values};
  } else if (values.ranges) {
    const val = values.ranges.values.map(({startIndex, endIndex}) => {
      return {start: startIndex, end: endIndex};
    });
    return {referenceType: "range", values: val};
  } else if (values.properties) {
    return {referenceType: "property", values: values.properties.values};
  } else if (values.elements) {
    return {referenceType: "element", values: values.elements.values};
  }
}

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

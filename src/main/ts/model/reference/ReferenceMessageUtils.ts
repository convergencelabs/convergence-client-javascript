import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {fromOptional} from "../../connection/ProtocolUtil";
import IReferenceValues = io.convergence.proto.IReferenceValues;
import {ReferenceType} from "./ReferenceType";

export function isReferenceMessage(message: IConvergenceMessage): boolean {
  return !!(message.referencePublished || message.referenceSet ||
    message.referenceCleared || message.referenceUnpublished);
}

export function getReferenceValueId(message: IConvergenceMessage): string | null {
  return (message.referencePublished && fromOptional(message.referencePublished.valueId)) ||
    (message.referenceSet && fromOptional(message.referenceSet.valueId)) ||
    (message.referenceCleared && fromOptional(message.referenceCleared.valueId)) ||
    (message.referenceUnpublished && fromOptional(message.referenceUnpublished.valueId));
}

export function getReferenceType(values: IReferenceValues): ReferenceType {
  if (values.indices) {
    return "index";
  } else if (values.ranges) {
    return "range";
  } else if (values.properties) {
    return "property";
  } else if (values.elements) {
    return "element";
  }
}

export function getReferenceValues(values: IReferenceValues): any[] {
  if (values.indices) {
    return values.indices.values;
  } else if (values.ranges) {
    return values.ranges.values.map(({startIndex, endIndex}) => {
      return {start: startIndex, end: endIndex};
    });
  } else if (values.properties) {
    return values.properties.values;
  } else if (values.elements) {
    return values.elements.values;
  }
}

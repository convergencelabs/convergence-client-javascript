import {io} from "@convergence/convergence-proto";
import IModelOperationData = io.convergence.proto.IModelOperationData;
import {ModelOperation} from "../ot/applied/ModelOperation";
import {AppliedCompoundOperation} from "../ot/applied/AppliedCompoundOperation";
import IAppliedCompoundOperationData = io.convergence.proto.operations.IAppliedCompoundOperationData;
import {AppliedOperation} from "../ot/applied/AppliedOperation";
import IAppliedDiscreteOperationData = io.convergence.proto.operations.IAppliedDiscreteOperationData;
import {AppliedDiscreteOperation} from "../ot/applied/AppliedDiscreteOperation";
import {AppliedArrayInsertOperation} from "../ot/applied/AppliedArrayInsertOperation";
import {toDataValue} from "../ModelMessageConverter";
import {AppliedArrayRemoveOperation} from "../ot/applied/AppliedArrayRemoveOperation";
import {AppliedArrayMoveOperation} from "../ot/applied/AppliedArrayMoveOperation";
import {AppliedArrayReplaceOperation} from "../ot/applied/AppliedArrayReplaceOperation";
import {AppliedArraySetOperation} from "../ot/applied/AppliedArraySetOperation";
import {AppliedObjectAddPropertyOperation} from "../ot/applied/AppliedObjectAddPropertyOperation";
import {AppliedObjectSetPropertyOperation} from "../ot/applied/AppliedObjectSetPropertyOperation";
import {AppliedObjectRemovePropertyOperation} from "../ot/applied/AppliedObjectRemovePropertyOperation";
import {AppliedObjectSetOperation} from "../ot/applied/AppliedObjectSetOperation";
import {mapObjectValues} from "../../util/ObjectUtils";
import {AppliedStringInsertOperation} from "../ot/applied/AppliedStringInsertOperation";
import {AppliedStringRemoveOperation} from "../ot/applied/AppliedStringRemoveOperation";
import {AppliedStringSetOperation} from "../ot/applied/AppliedStringSetOperation";
import {AppliedNumberDeltaOperation} from "../ot/applied/AppliedNumberDeltaOperation";
import {AppliedNumberSetOperation} from "../ot/applied/AppliedNumberSetOperation";
import {AppliedBooleanSetOperation} from "../ot/applied/AppliedBooleanSetOperation";
import {AppliedDateSetOperation} from "../ot/applied/AppliedDateSetOperation";
import {ConvergenceError} from "../../util";
import {
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  getOrDefaultString,
  timestampToDate
} from "../../connection/ProtocolUtil";
import {IdentityCache} from "../../identity/IdentityCache";

export function toModelOperation(operationData: IModelOperationData, identityCache: IdentityCache): ModelOperation {
  let appliedOp: AppliedOperation;
  if (operationData.operation.compoundOperation) {
    appliedOp = toCompoundOperation(operationData.operation.compoundOperation);
  } else if (operationData.operation.discreteOperation) {
    appliedOp = toDiscreteOperation(operationData.operation.discreteOperation);
  } else {
    throw new ConvergenceError("Invalid model operation: " + JSON.stringify(operationData));
  }

  return new ModelOperation(
    operationData.modelId,
    getOrDefaultNumber(operationData.version),
    timestampToDate(operationData.timestamp),
    identityCache.getUserForSession(operationData.sessionId),
    operationData.sessionId,
    appliedOp
  );
}

function toCompoundOperation(compoundOperationData: IAppliedCompoundOperationData): AppliedCompoundOperation {
  const discreteOps = getOrDefaultArray(compoundOperationData.operations).map(toDiscreteOperation);
  return new AppliedCompoundOperation(discreteOps);
}

function toDiscreteOperation(discreteOperationData: IAppliedDiscreteOperationData): AppliedDiscreteOperation {
  if (discreteOperationData.arrayInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayInsertOperation;
    return new AppliedArrayInsertOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      toDataValue(value));
  } else if (discreteOperationData.arrayRemoveOperation) {
    const {id, noOp, index, oldValue} = discreteOperationData.arrayRemoveOperation;
    return new AppliedArrayRemoveOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      toDataValue(oldValue));
  } else if (discreteOperationData.arrayMoveOperation) {
    const {id, noOp, fromIndex, toIndex} = discreteOperationData.arrayMoveOperation;
    return new AppliedArrayMoveOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(fromIndex),
      getOrDefaultNumber(toIndex));
  } else if (discreteOperationData.arrayReplaceOperation) {
    const {id, noOp, index, value, oldValue} = discreteOperationData.arrayReplaceOperation;
    return new AppliedArrayReplaceOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      toDataValue(value),
      toDataValue(oldValue));
  } else if (discreteOperationData.arraySetOperation) {
    const {id, noOp, values, oldValues} = discreteOperationData.arraySetOperation;
    return new AppliedArraySetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultArray(values).map(toDataValue),
      getOrDefaultArray(oldValues).map(toDataValue));
  } else if (discreteOperationData.objectAddPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectAddPropertyOperation;
    return new AppliedObjectAddPropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key),
      toDataValue(value));
  } else if (discreteOperationData.objectSetPropertyOperation) {
    const {id, noOp, key, value, oldValue} = discreteOperationData.objectSetPropertyOperation;
    return new AppliedObjectSetPropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key),
      toDataValue(value),
      toDataValue(oldValue));
  } else if (discreteOperationData.objectRemovePropertyOperation) {
    const {id, noOp, key, oldValue} = discreteOperationData.objectSetPropertyOperation;
    return new AppliedObjectRemovePropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key),
      toDataValue(oldValue));
  } else if (discreteOperationData.objectSetOperation) {
    const {id, noOp, values, oldValues} = discreteOperationData.objectSetOperation;
    return new AppliedObjectSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      mapObjectValues(values, toDataValue),
      mapObjectValues(oldValues, toDataValue));
  } else if (discreteOperationData.stringInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringInsertOperation;
    return new AppliedStringInsertOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      getOrDefaultString(value));
  } else if (discreteOperationData.stringRemoveOperation) {
    const {id, noOp, index, oldValue} = discreteOperationData.stringRemoveOperation;
    return new AppliedStringRemoveOperation(id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      getOrDefaultString(oldValue));
  } else if (discreteOperationData.stringSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.stringSetOperation;
    return new AppliedStringSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(value),
      getOrDefaultString(oldValue));
  } else if (discreteOperationData.numberDeltaOperation) {
    const {id, noOp, delta} = discreteOperationData.numberDeltaOperation;
    return new AppliedNumberDeltaOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(delta));
  } else if (discreteOperationData.numberSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.numberSetOperation;
    return new AppliedNumberSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(value),
      getOrDefaultNumber(oldValue));
  } else if (discreteOperationData.booleanSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.booleanSetOperation;
    return new AppliedBooleanSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultBoolean(value),
      getOrDefaultBoolean(oldValue));
  } else if (discreteOperationData.dateSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.dateSetOperation;
    return new AppliedDateSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      timestampToDate(value),
      timestampToDate(oldValue));
  }
}

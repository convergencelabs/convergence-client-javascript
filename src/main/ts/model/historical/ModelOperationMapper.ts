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
import {AppliedNumberAddOperation} from "../ot/applied/AppliedNumberAddOperation";
import {AppliedNumberSetOperation} from "../ot/applied/AppliedNumberSetOperation";
import {AppliedBooleanSetOperation} from "../ot/applied/AppliedBooleanSetOperation";
import {AppliedDateSetOperation} from "../ot/applied/AppliedDateSetOperation";
import {ConvergenceError} from "../../util";
import {timestampToDate} from "../../connection/ProtocolUtil";

export function toModelOperation(operationData: IModelOperationData): ModelOperation {
  let appliedOp: AppliedOperation;
  if (operationData.operation.compoundOperation) {
    appliedOp = toCompoundOperation(operationData.operation.compoundOperation);
  } else if (operationData.operation.discreteOperation) {
    appliedOp = toDiscreteOperation(operationData.operation.discreteOperation);
  } else {
    throw new ConvergenceError("Invalid model operation: " + JSON.stringify(operationData));
  }

  // FIXME username
  const username = "";
  return new ModelOperation(
    operationData.modelId,
    operationData.version as number,
    timestampToDate(operationData.timestamp),
    username,
    operationData.sessionId,
    appliedOp
  );
}

function toCompoundOperation(compoundOperationData: IAppliedCompoundOperationData): AppliedCompoundOperation {
  const discreteOps = compoundOperationData.operations.map(toDiscreteOperation);
  return new AppliedCompoundOperation(discreteOps);
}

function toDiscreteOperation(discreteOperationData: IAppliedDiscreteOperationData): AppliedDiscreteOperation {
  if (discreteOperationData.arrayInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayInsertOperation;
    return new AppliedArrayInsertOperation(id, noOp, index, toDataValue(value));
  } else if (discreteOperationData.arrayRemoveOperation) {
    const {id, noOp, index, oldValue} = discreteOperationData.arrayRemoveOperation;
    return new AppliedArrayRemoveOperation(id, noOp, index, toDataValue(oldValue));
  } else if (discreteOperationData.arrayMoveOperation) {
    const {id, noOp, fromIndex, toIndex} = discreteOperationData.arrayMoveOperation;
    return new AppliedArrayMoveOperation(id, noOp, fromIndex, toIndex);
  } else if (discreteOperationData.arrayReplaceOperation) {
    const {id, noOp, index, value, oldValue} = discreteOperationData.arrayReplaceOperation;
    return new AppliedArrayReplaceOperation(id, noOp, index, toDataValue(value), toDataValue(oldValue));
  } else if (discreteOperationData.arraySetOperation) {
    const {id, noOp, values, oldValues} = discreteOperationData.arraySetOperation;
    return new AppliedArraySetOperation(id, noOp, values.map(toDataValue), oldValues.map(toDataValue));
  } else if (discreteOperationData.objectAddPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectAddPropertyOperation;
    return new AppliedObjectAddPropertyOperation(id, noOp, key, toDataValue(value));
  } else if (discreteOperationData.objectSetPropertyOperation) {
    const {id, noOp, key, value, oldValue} = discreteOperationData.objectSetPropertyOperation;
    return new AppliedObjectSetPropertyOperation(id, noOp, key, toDataValue(value), toDataValue(oldValue));
  } else if (discreteOperationData.objectRemovePropertyOperation) {
    const {id, noOp, key, oldValue} = discreteOperationData.objectSetPropertyOperation;
    return new AppliedObjectRemovePropertyOperation(id, noOp, key, toDataValue(oldValue));
  } else if (discreteOperationData.objectSetOperation) {
    const {id, noOp, values, oldValues} = discreteOperationData.objectSetOperation;
    return new AppliedObjectSetOperation(
      id, noOp, mapObjectValues(values, toDataValue), mapObjectValues(oldValues, toDataValue));
  } else if (discreteOperationData.stringInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringInsertOperation;
    return new AppliedStringInsertOperation(id, noOp, index, value);
  } else if (discreteOperationData.stringRemoveOperation) {
    const {id, noOp, index, oldValue} = discreteOperationData.stringRemoveOperation;
    return new AppliedStringRemoveOperation(id, noOp, index, oldValue);
  } else if (discreteOperationData.stringSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.stringSetOperation;
    return new AppliedStringSetOperation(id, noOp, value, oldValue);
  } else if (discreteOperationData.numberDeltaOperation) {
    const {id, noOp, value} = discreteOperationData.numberDeltaOperation;
    return new AppliedNumberAddOperation(id, noOp, value);
  } else if (discreteOperationData.numberSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.numberSetOperation;
    return new AppliedNumberSetOperation(id, noOp, value, oldValue);
  } else if (discreteOperationData.booleanSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.booleanSetOperation;
    return new AppliedBooleanSetOperation(id, noOp, value, oldValue);
  } else if (discreteOperationData.dateSetOperation) {
    const {id, noOp, value, oldValue} = discreteOperationData.dateSetOperation;
    return new AppliedDateSetOperation(
      id, noOp, timestampToDate(value), timestampToDate(oldValue));
  }
}

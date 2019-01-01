import {io} from "@convergence/convergence-proto";
import IOperationData = io.convergence.proto.IOperationData;
import {Operation} from "./ot/ops/Operation";
import {ConvergenceError} from "../util";
import ICompoundOperationData = io.convergence.proto.ICompoundOperationData;
import {CompoundOperation} from "./ot/ops/CompoundOperation";
import IDiscreteOperationData = io.convergence.proto.IDiscreteOperationData;
import {DiscreteOperation} from "./ot/ops/DiscreteOperation";
import {ArrayInsertOperation} from "./ot/ops/ArrayInsertOperation";
import {toDataValue, toIDataValue} from "./ModelMessageConverter";
import {ArrayRemoveOperation} from "./ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "./ot/ops/ArrayMoveOperation";
import {ArrayReplaceOperation} from "./ot/ops/ArrayReplaceOperation";
import {ArraySetOperation} from "./ot/ops/ArraySetOperation";
import {ObjectAddPropertyOperation} from "./ot/ops/ObjectAddPropertyOperation";
import {ObjectSetPropertyOperation} from "./ot/ops/ObjectSetPropertyOperation";
import {ObjectRemovePropertyOperation} from "./ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "./ot/ops/ObjectSetOperation";
import {mapObjectValues} from "../util/ObjectUtils";
import {StringInsertOperation} from "./ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "./ot/ops/StringRemoveOperation";
import {StringSetOperation} from "./ot/ops/StringSetOperation";
import {NumberAddOperation} from "./ot/ops/NumberAddOperation";
import {NumberSetOperation} from "./ot/ops/NumberSetOperation";
import {BooleanSetOperation} from "./ot/ops/BooleanSetOperation";
import {DateSetOperation} from "./ot/ops/DateSetOperation";
import {dateToTimestamp, timestampToDate} from "../connection/ProtocolUtil";

export function toOperation(operationData: IOperationData): Operation {
  if (operationData.compoundOperation) {
    return toCompoundOperation(operationData.compoundOperation);
  } else if (operationData.discreteOperation) {
    return toDiscreteOperation(operationData.discreteOperation);
  } else {
    throw new ConvergenceError("Invalid operation data: " + JSON.stringify(operationData));
  }
}

function toCompoundOperation(compoundOperationData: ICompoundOperationData): CompoundOperation {
  const discreteOps = compoundOperationData.operations.map(toDiscreteOperation);
  return new CompoundOperation(discreteOps);
}

function toDiscreteOperation(discreteOperationData: IDiscreteOperationData): DiscreteOperation {
  if (discreteOperationData.arrayInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayInsertOperation;
    return new ArrayInsertOperation(id, noOp, index, toDataValue(value));
  } else if (discreteOperationData.arrayRemoveOperation) {
    const {id, noOp, index} = discreteOperationData.arrayRemoveOperation;
    return new ArrayRemoveOperation(id, noOp, index);
  } else if (discreteOperationData.arrayMoveOperation) {
    const {id, noOp, fromIndex, toIndex} = discreteOperationData.arrayMoveOperation;
    return new ArrayMoveOperation(id, noOp, fromIndex, toIndex);
  } else if (discreteOperationData.arrayReplaceOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayReplaceOperation;
    return new ArrayReplaceOperation(id, noOp, index, toDataValue(value));
  } else if (discreteOperationData.arraySetOperation) {
    const {id, noOp, values} = discreteOperationData.arraySetOperation;
    return new ArraySetOperation(id, noOp, values.map(toDataValue));
  } else if (discreteOperationData.objectAddPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectAddPropertyOperation;
    return new ObjectAddPropertyOperation(id, noOp, key, toDataValue(value));
  } else if (discreteOperationData.objectSetPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectSetPropertyOperation;
    return new ObjectSetPropertyOperation(id, noOp, key, toDataValue(value));
  } else if (discreteOperationData.objectRemovePropertyOperation) {
    const {id, noOp, key} = discreteOperationData.objectSetPropertyOperation;
    return new ObjectRemovePropertyOperation(id, noOp, key);
  } else if (discreteOperationData.objectSetOperation) {
    const {id, noOp, values} = discreteOperationData.objectSetOperation;
    return new ObjectSetOperation(id, noOp, mapObjectValues(values, toDataValue));
  } else if (discreteOperationData.stringInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringInsertOperation;
    return new StringInsertOperation(id, noOp, index, value);
  } else if (discreteOperationData.stringRemoveOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringRemoveOperation;
    return new StringRemoveOperation(id, noOp, index, value);
  } else if (discreteOperationData.stringSetOperation) {
    const {id, noOp, value} = discreteOperationData.stringSetOperation;
    return new StringSetOperation(id, noOp, value);
  } else if (discreteOperationData.numberDeltaOperation) {
    const {id, noOp, value} = discreteOperationData.numberDeltaOperation;
    return new NumberAddOperation(id, noOp, value);
  } else if (discreteOperationData.numberSetOperation) {
    const {id, noOp, value} = discreteOperationData.numberSetOperation;
    return new NumberSetOperation(id, noOp, value);
  } else if (discreteOperationData.booleanSetOperation) {
    const {id, noOp, value} = discreteOperationData.booleanSetOperation;
    return new BooleanSetOperation(id, noOp, value);
  } else if (discreteOperationData.dateSetOperation) {
    const {id, noOp, value} = discreteOperationData.dateSetOperation;
    return new DateSetOperation(id, noOp, timestampToDate(value));
  }
}

export function toIOperationData(operation: Operation): IOperationData {
  if (operation instanceof CompoundOperation) {
    return {compoundOperation: toICompoundOperationData(operation)};
  } else if (operation instanceof DiscreteOperation) {
    return {discreteOperation: toIDiscreteOperationData(operation)};
  } else {
    throw new ConvergenceError("Invalid operation data: " + JSON.stringify(operation));
  }
}

function toICompoundOperationData(compoundOperation: CompoundOperation): ICompoundOperationData {
  const operations = compoundOperation.ops.map(toIDiscreteOperationData);
  return {operations};
}

function toIDiscreteOperationData(op: DiscreteOperation): IDiscreteOperationData {
  if (op instanceof ArrayInsertOperation) {
    const {id, noOp, index, value} = op;
    return {arrayInsertOperation: {id, noOp, index, value: toIDataValue(value)}};
  } else if (op instanceof ArrayRemoveOperation) {
    const {id, noOp, index} = op;
    return {arrayRemoveOperation: {id, noOp, index}};
  } else if (op instanceof ArrayMoveOperation) {
    const {id, noOp, fromIndex, toIndex} = op;
    return {arrayMoveOperation: {id, noOp, fromIndex, toIndex}};
  } else if (op instanceof ArrayReplaceOperation) {
    const {id, noOp, index, value} = op;
    return {arrayReplaceOperation: {id, noOp, index, value: toIDataValue(value)}};
  } else if (op instanceof ArraySetOperation) {
    const {id, noOp, value} = op;
    return {arraySetOperation: {id, noOp, values: value.map(toIDataValue)}};
  } else if (op instanceof ObjectAddPropertyOperation) {
    const {id, noOp, prop, value} = op;
    return {objectAddPropertyOperation: {id, noOp, key: prop, value: toIDataValue(value)}};
  } else if (op instanceof ObjectSetPropertyOperation) {
    const {id, noOp, prop, value} = op;
    return {objectSetPropertyOperation: {id, noOp, key: prop, value: toIDataValue(value)}};
  } else if (op instanceof ObjectRemovePropertyOperation) {
    const {id, noOp, prop} = op;
    return {objectRemovePropertyOperation: {id, noOp, key: prop}};
  } else if (op instanceof ObjectSetOperation) {
    const {id, noOp, value} = op;
    return {objectSetOperation: {id, noOp, values: mapObjectValues(value, toIDataValue)}};
  } else if (op instanceof StringInsertOperation) {
    const {id, noOp, index, value} = op;
    return {stringInsertOperation: {id, noOp, index, value}};
  } else if (op instanceof StringRemoveOperation) {
    const {id, noOp, index, value} = op;
    return {stringRemoveOperation: {id, noOp, index, value}};
  } else if (op instanceof StringSetOperation) {
    const {id, noOp, value} = op;
    return {stringSetOperation: {id, noOp, value}};
  } else if (op instanceof NumberAddOperation) {
    const {id, noOp, value} = op;
    return {numberDeltaOperation: {id, noOp, value}};
  } else if (op instanceof NumberSetOperation) {
    const {id, noOp, value} = op;
    return {numberSetOperation: {id, noOp, value}};
  } else if (op instanceof BooleanSetOperation) {
    const {id, noOp, value} = op;
    return {booleanSetOperation: {id, noOp, value}};
  } else if (op instanceof DateSetOperation) {
    const {id, noOp, value} = op;
    return {dateSetOperation: {id, noOp, value: dateToTimestamp(value)}};
  }
}

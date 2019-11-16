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

import {Operation} from "./ot/ops/Operation";
import {ConvergenceError} from "../util";
import {CompoundOperation} from "./ot/ops/CompoundOperation";
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
import {NumberDeltaOperation} from "./ot/ops/NumberDeltaOperation";
import {NumberSetOperation} from "./ot/ops/NumberSetOperation";
import {BooleanSetOperation} from "./ot/ops/BooleanSetOperation";
import {DateSetOperation} from "./ot/ops/DateSetOperation";
import {
  dateToTimestamp,
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  getOrDefaultString,
  timestampToDate
} from "../connection/ProtocolUtil";

import {com} from "@convergence/convergence-proto";
import IOperationData = com.convergencelabs.convergence.proto.model.IOperationData;
import ICompoundOperationData = com.convergencelabs.convergence.proto.model.ICompoundOperationData;
import IDiscreteOperationData = com.convergencelabs.convergence.proto.model.IDiscreteOperationData;

/**
 * @hidden
 * @internal
 */
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
  const discreteOps = getOrDefaultArray(compoundOperationData.operations).map(toDiscreteOperation);
  return new CompoundOperation(discreteOps);
}

function toDiscreteOperation(discreteOperationData: IDiscreteOperationData): DiscreteOperation {
  if (discreteOperationData.arrayInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayInsertOperation;
    return new ArrayInsertOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      toDataValue(value));
  } else if (discreteOperationData.arrayRemoveOperation) {
    const {id, noOp, index} = discreteOperationData.arrayRemoveOperation;
    return new ArrayRemoveOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index));
  } else if (discreteOperationData.arrayMoveOperation) {
    const {id, noOp, fromIndex, toIndex} = discreteOperationData.arrayMoveOperation;
    return new ArrayMoveOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(fromIndex),
      getOrDefaultNumber(toIndex));
  } else if (discreteOperationData.arrayReplaceOperation) {
    const {id, noOp, index, value} = discreteOperationData.arrayReplaceOperation;
    return new ArrayReplaceOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      toDataValue(value));
  } else if (discreteOperationData.arraySetOperation) {
    const {id, noOp, values} = discreteOperationData.arraySetOperation;
    return new ArraySetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultArray(values).map(toDataValue));
  } else if (discreteOperationData.objectAddPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectAddPropertyOperation;
    return new ObjectAddPropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key),
      toDataValue(value));
  } else if (discreteOperationData.objectSetPropertyOperation) {
    const {id, noOp, key, value} = discreteOperationData.objectSetPropertyOperation;
    return new ObjectSetPropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key),
      toDataValue(value));
  } else if (discreteOperationData.objectRemovePropertyOperation) {
    const {id, noOp, key} = discreteOperationData.objectRemovePropertyOperation;
    return new ObjectRemovePropertyOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(key));
  } else if (discreteOperationData.objectSetOperation) {
    const {id, noOp, values} = discreteOperationData.objectSetOperation;
    return new ObjectSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      mapObjectValues(values, toDataValue));
  } else if (discreteOperationData.stringInsertOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringInsertOperation;
    return new StringInsertOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      getOrDefaultString(value));
  } else if (discreteOperationData.stringRemoveOperation) {
    const {id, noOp, index, value} = discreteOperationData.stringRemoveOperation;
    return new StringRemoveOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(index),
      getOrDefaultString(value));
  } else if (discreteOperationData.stringSetOperation) {
    const {id, noOp, value} = discreteOperationData.stringSetOperation;
    return new StringSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultString(value));
  } else if (discreteOperationData.numberDeltaOperation) {
    const {id, noOp, delta} = discreteOperationData.numberDeltaOperation;
    return new NumberDeltaOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(delta));
  } else if (discreteOperationData.numberSetOperation) {
    const {id, noOp, value} = discreteOperationData.numberSetOperation;
    return new NumberSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultNumber(value));
  } else if (discreteOperationData.booleanSetOperation) {
    const {id, noOp, value} = discreteOperationData.booleanSetOperation;
    return new BooleanSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      getOrDefaultBoolean(value));
  } else if (discreteOperationData.dateSetOperation) {
    const {id, noOp, value} = discreteOperationData.dateSetOperation;
    return new DateSetOperation(
      id,
      getOrDefaultBoolean(noOp),
      timestampToDate(value));
  }
}

/**
 * @hidden
 * @internal
 */
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
  } else if (op instanceof NumberDeltaOperation) {
    const {id, noOp, delta} = op;
    return {numberDeltaOperation: {id, noOp, delta}};
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

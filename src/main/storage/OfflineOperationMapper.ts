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

import {Operation} from "../model/ot/ops/Operation";
import {
  IArrayInsertOperationData,
  IArrayMoveOperationData,
  IArrayRemoveOperationData,
  IArrayReplaceOperationData,
  IArraySetOperationData,
  IBooleanSetOperationData,
  ICompoundOperationData,
  IDateSetOperationData,
  IModelDiscreteOperationData,
  IModelOperationData,
  INumberDeltaOperationData,
  INumberSetOperationData,
  IObjectAddPropertyOperationData,
  IObjectRemovePropertyOperationData,
  IObjectSetOperationData,
  IObjectSetPropertyOperationData,
  IStringInsertOperationData,
  IStringRemoveOperationData,
  IStringSetOperationData
} from "./api";
import {ArrayInsertOperation} from "../model/ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../model/ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../model/ot/ops/ArrayReplaceOperation";
import {ArraySetOperation} from "../model/ot/ops/ArraySetOperation";
import {ArrayMoveOperation} from "../model/ot/ops/ArrayMoveOperation";
import {ObjectAddPropertyOperation} from "../model/ot/ops/ObjectAddPropertyOperation";
import {ObjectSetPropertyOperation} from "../model/ot/ops/ObjectSetPropertyOperation";
import {ObjectRemovePropertyOperation} from "../model/ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../model/ot/ops/ObjectSetOperation";
import {StringInsertOperation} from "../model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../model/ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../model/ot/ops/StringSetOperation";
import {NumberDeltaOperation} from "../model/ot/ops/NumberDeltaOperation";
import {NumberSetOperation} from "../model/ot/ops/NumberSetOperation";
import {BooleanSetOperation} from "../model/ot/ops/BooleanSetOperation";
import {DateSetOperation} from "../model/ot/ops/DateSetOperation";
import {CompoundOperation} from "../model/ot/ops/CompoundOperation";

/**
 * @hidden
 * @internal
 */
export function toOfflineOperationData(op: Operation): IModelOperationData {
  if (op instanceof CompoundOperation) {
    const opData = op.ops.map(o => toOfflineOperationData(o)) as IModelDiscreteOperationData[];
    return {type: "compound", ops: opData} as ICompoundOperationData;
  } else if (op instanceof ArrayInsertOperation) {
    return {
      type: "array_insert",
      id: op.id,
      noOp: op.noOp,
      index: op.index,
      value: op.value
    } as IArrayInsertOperationData;
  } else if (op instanceof ArrayReplaceOperation) {
    return {
      type: "array_replace",
      id: op.id,
      noOp: op.noOp,
      index: op.index,
      value: op.value
    } as IArrayReplaceOperationData;
  } else if (op instanceof ArrayRemoveOperation) {
    return {
      type: "array_remove",
      id: op.id,
      noOp: op.noOp,
      index: op.index
    } as IArrayRemoveOperationData;
  } else if (op instanceof ArrayMoveOperation) {
    return {
      type: "array_move",
      id: op.id,
      noOp: op.noOp,
      fromIndex: op.fromIndex,
      toIndex: op.toIndex
    } as IArrayMoveOperationData;
  } else if (op instanceof ArraySetOperation) {
    return {
      type: "array_set",
      id: op.id,
      noOp: op.noOp,
      value: op.value
    } as IArraySetOperationData;
  } else if (op instanceof ObjectAddPropertyOperation) {
    return {
      type: "object_add_property",
      id: op.id,
      noOp: op.noOp,
      key: op.prop,
      value: op.value
    } as IObjectAddPropertyOperationData;
  } else if (op instanceof ObjectSetPropertyOperation) {
    return {
      type: "object_set_property",
      id: op.id,
      noOp: op.noOp,
      key: op.prop,
      value: op.value
    } as IObjectSetPropertyOperationData;
  } else if (op instanceof ObjectRemovePropertyOperation) {
    return {
      type: "object_remove_property",
      id: op.id,
      noOp: op.noOp,
      key: op.prop
    } as IObjectRemovePropertyOperationData;
  } else if (op instanceof ObjectSetOperation) {
    return {
      type: "object_set",
      id: op.id,
      noOp: op.noOp,
      value: op.value
    } as IObjectSetOperationData;
  } else if (op instanceof StringInsertOperation) {
    return {
      type: "string_insert",
      id: op.id,
      noOp: op.noOp,
      index: op.index,
      value: op.value
    } as IStringInsertOperationData;
  } else if (op instanceof StringRemoveOperation) {
    return {
      type: "string_remove",
      id: op.id,
      noOp: op.noOp,
      index: op.index,
      value: op.value
    } as IStringRemoveOperationData;
  } else if (op instanceof StringSetOperation) {
    return {
      type: "string_set",
      id: op.id,
      noOp: op.noOp,
      value: op.value
    } as IStringSetOperationData;
  } else if (op instanceof NumberDeltaOperation) {
    return {
      type: "number_delta",
      noOp: op.noOp,
      value: op.delta
    } as INumberDeltaOperationData;
  } else if (op instanceof NumberSetOperation) {
    return {
      type: "number_set",
      noOp: op.noOp,
      value: op.value
    } as INumberSetOperationData;
  } else if (op instanceof BooleanSetOperation) {
    return {
      type: "boolean_set",
      id: op.id,
      noOp: op.noOp,
      value: op.value
    } as IBooleanSetOperationData;
  } else if (op instanceof DateSetOperation) {
    return {
      type: "date_set",
      id: op.id,
      noOp: op.noOp,
      value: op.value
    } as IDateSetOperationData;
  }
}

/**
 * @hidden
 * @internal
 */
export function fromOfflineOperationData(op: IModelOperationData): Operation {
  switch (op.type) {
    case "array_insert":
      const ai = op as IArrayInsertOperationData;
      return new ArrayInsertOperation(ai.id, ai.noOp, ai.index, ai.value);
    case "array_remove":
      const ar = op as IArrayRemoveOperationData;
      return new ArrayRemoveOperation(ar.id, ar.noOp, ar.index);
    case "array_replace":
      const ap = op as IArrayReplaceOperationData;
      return new ArrayReplaceOperation(ap.id, ap.noOp, ap.index, ap.value);
    case "array_move":
      const am = op as IArrayMoveOperationData;
      return new ArrayMoveOperation(am.id, am.noOp, am.fromIndex, am.toIndex);
    case "array_set":
      const as = op as IArraySetOperationData;
      return new ArraySetOperation(as.id, as.noOp, as.value);

    case "object_add_property":
      const oap = op as IObjectAddPropertyOperationData;
      return new ObjectAddPropertyOperation(oap.id, oap.noOp, oap.key, oap.value);
    case "object_set_property":
      const osp = op as IObjectSetPropertyOperationData;
      return new ObjectSetPropertyOperation(osp.id, osp.noOp, osp.key, osp.value);
    case "object_remove_property":
      const orp = op as IObjectRemovePropertyOperationData;
      return new ObjectRemovePropertyOperation(orp.id, orp.noOp, orp.key);
    case "object_set":
      const os = op as IObjectSetOperationData;
      return new ObjectSetOperation(os.id, os.noOp, os.value);

    case "string_insert":
      const si = op as IStringInsertOperationData;
      return new StringInsertOperation(si.id, si.noOp, si.index, si.value);
    case "string_remove":
      const sr = op as IStringRemoveOperationData;
      return new StringRemoveOperation(sr.id, sr.noOp, sr.index, sr.value);
    case "string_set":
      const ss = op as IStringSetOperationData;
      return new StringSetOperation(ss.id, ss.noOp, ss.value);

    case "number_delta":
      const nd = op as INumberDeltaOperationData;
      return new NumberDeltaOperation(nd.id, nd.noOp, nd.value);
    case "number_set":
      const ns = op as INumberSetOperationData;
      return new NumberSetOperation(ns.id, ns.noOp, ns.value);

    case "boolean_set":
      const bs = op as IBooleanSetOperationData;
      return new BooleanSetOperation(bs.id, bs.noOp, bs.value);

    case "date_set":
      const ds = op as IDateSetOperationData;
      return new DateSetOperation(ds.id, ds.noOp, ds.value);

    case "compound":
      const co = op as ICompoundOperationData;
      const ops = co.ops.map(o => fromOfflineOperationData(o));
      return new CompoundOperation(ops as DateSetOperation[]);
  }
}

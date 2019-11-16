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

import {DiscreteOperation} from "../ops/DiscreteOperation";
import {OperationTransformationFunction} from "./OperationTransformationFunction";
import {ArrayInsertInsertOTF} from "./array/ArrayInsertInsertOTF";
import {ArrayInsertRemoveOTF} from "./array/ArrayInsertRemoveOTF";
import {ArrayInsertReplaceOTF} from "./array/ArrayInsertReplaceOTF";
import {ArrayInsertMoveOTF} from "./array/ArrayInsertMoveOTF";
import {ArrayInsertSetOTF} from "./array/ArrayInsertSetOTF";
import {ArrayRemoveInsertOTF} from "./array/ArrayRemoveInsertOTF";
import {ArrayRemoveRemoveOTF} from "./array/ArrayRemoveRemoveOTF";
import {ArrayRemoveReplaceOTF} from "./array/ArrayRemoveReplaceOTF";
import {ArrayRemoveMoveOTF} from "./array/ArrayRemoveMoveOTF";
import {ArrayRemoveSetOTF} from "./array/ArrayRemoveSetOTF";
import {ArrayReplaceInsertOTF} from "./array/ArrayReplaceInsertOTF";
import {ArrayReplaceRemoveOTF} from "./array/ArrayReplaceRemoveOTF";
import {ArrayReplaceReplaceOTF} from "./array/ArrayReplaceReplaceOTF";
import {ArrayReplaceMoveOTF} from "./array/ArrayReplaceMoveOTF";
import {ArrayReplaceSetOTF} from "./array/ArrayReplaceSetOTF";
import {ArrayMoveInsertOTF} from "./array/ArrayMoveInsertOTF";
import {ArrayMoveRemoveOTF} from "./array/ArrayMoveRemoveOTF";
import {ArrayMoveReplaceOTF} from "./array/ArrayMoveReplaceOTF";
import {ArrayMoveMoveOTF} from "./array/ArrayMoveMoveOTF";
import {ArrayMoveSetOTF} from "./array/ArrayMoveSetOTF";
import {ArraySetInsertOTF} from "./array/ArraySetInsertOTF";
import {ArraySetRemoveOTF} from "./array/ArraySetRemoveOTF";
import {ArraySetReplaceOTF} from "./array/ArraySetReplaceOTF";
import {ArraySetMoveOTF} from "./array/ArraySetMoveOTF";
import {ArraySetSetOTF} from "./array/ArraySetSetOTF";
import {StringInsertInsertOTF} from "./string/StringInsertInsertOTF";
import {StringInsertRemoveOTF} from "./string/StringInsertRemoveOTF";
import {StringInsertSetOTF} from "./string/StringInsertSetOTF";
import {StringRemoveInsertOTF} from "./string/StringRemoveInsertOTF";
import {StringRemoveRemoveOTF} from "./string/StringRemoveRemoveOTF";
import {StringRemoveSetOTF} from "./string/StringRemoveSetOTF";
import {StringSetInsertOTF} from "./string/StringSetInsertOTF";
import {StringSetRemoveOTF} from "./string/StringSetRemoveOTF";
import {StringSetSetOTF} from "./string/StringSetSetOTF";
import {NumberAddAddOTF} from "./number/NumberAddAddOTF";
import {NumberAddSetOTF} from "./number/NumberAddSetOTF";
import {NumberSetAddOTF} from "./number/NumberSetAddOTF";
import {NumberSetSetOTF} from "./number/NumberSetSetOTF";
import {BooleanSetSetOTF} from "./bool/BooleanSetSetOTF";
import {ObjectAddPropertyAddPropertyOTF} from "./object/ObjectAddPropertyAddPropertyOTF";
import {ObjectAddPropertySetPropertyOTF} from "./object/ObjectAddPropertySetPropertyOTF";
import {ObjectAddPropertyRemovePropertyOTF} from "./object/ObjectAddPropertyRemovePropertyOTF";
import {ObjectRemovePropertyAddPropertyOTF} from "./object/ObjectRemovePropertyAddPropertyOTF";
import {ObjectRemovePropertySetPropertyOTF} from "./object/ObjectRemovePropertySetPropertyOTF";
import {ObjectRemovePropertyRemovePropertyOTF} from "./object/ObjectRemovePropertyRemovePropertyOTF";
import {ObjectAddPropertySetOTF} from "./object/ObjectAddPropertySetOTF";
import {ObjectRemovePropertySetOTF} from "./object/ObjectRemovePropertySetOTF";
import {ObjectSetPropertyAddPropertyOTF} from "./object/ObjectSetPropertyAddPropertyOTF";
import {ObjectSetPropertySetPropertyOTF} from "./object/ObjectSetPropertySetPropertyOTF";
import {ObjectSetPropertyRemovePropertyOTF} from "./object/ObjectSetPropertyRemovePropertyOTF";
import {ObjectSetPropertySetOTF} from "./object/ObjectSetPropertySetOTF";
import {ObjectSetAddPropertyOTF} from "./object/ObjectSetAddPropertyOTF";
import {ObjectSetSetPropertyOTF} from "./object/ObjectSetSetPropertyOTF";
import {ObjectSetRemovePropertyOTF} from "./object/ObjectSetRemovePropertyOTF";
import {ObjectSetSetOTF} from "./object/ObjectSetSetOTF";
import {ReferenceTransformationFunction} from "./ReferenceTransformationFunction";
import {ModelReferenceData} from "./ReferenceTransformer";
import {ModelReference} from "../../reference/ModelReference";
import {
  StringInsertIndexTransformationFunction,
  StringRemoveIndexTransformationFunction,
  StringSetIndexTransformationFunction
} from "./reference/IndexTransformationFunctions";
import {OperationType} from "../ops/OperationType";
import {
  StringInsertRangeTransformationFunction,
  StringRemoveRangeTransformationFunction,
  StringSetRangeTransformationFunction
} from "./reference/RangeTransformationFunctions";
import {DateSetSetOTF} from "./date/DateSetSetOTF";

/**
 * @hidden
 * @internal
 */
export class TransformationFunctionRegistry {
  private _otfs: { [key: string]: OperationTransformationFunction<any, any> };
  private _rtfs: { [key: string]: ReferenceTransformationFunction };

  constructor() {
    this._otfs = {};
    this._rtfs = {};

    // string Functions
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_INSERT, StringInsertInsertOTF);
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_REMOVE, StringInsertRemoveOTF);
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_VALUE, StringInsertSetOTF);

    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_INSERT, StringRemoveInsertOTF);
    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_REMOVE, StringRemoveRemoveOTF);
    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_VALUE, StringRemoveSetOTF);

    this.registerOtf(OperationType.STRING_VALUE, OperationType.STRING_INSERT, StringSetInsertOTF);
    this.registerOtf(OperationType.STRING_VALUE, OperationType.STRING_REMOVE, StringSetRemoveOTF);
    this.registerOtf(OperationType.STRING_VALUE, OperationType.STRING_VALUE, StringSetSetOTF);

    // object Functions
    this.registerOtf(OperationType.OBJECT_ADD, OperationType.OBJECT_ADD, ObjectAddPropertyAddPropertyOTF);
    this.registerOtf(OperationType.OBJECT_ADD, OperationType.OBJECT_SET, ObjectAddPropertySetPropertyOTF);
    this.registerOtf(OperationType.OBJECT_ADD, OperationType.OBJECT_REMOVE, ObjectAddPropertyRemovePropertyOTF);
    this.registerOtf(OperationType.OBJECT_ADD, OperationType.OBJECT_VALUE, ObjectAddPropertySetOTF);

    this.registerOtf(OperationType.OBJECT_REMOVE, OperationType.OBJECT_ADD, ObjectRemovePropertyAddPropertyOTF);
    this.registerOtf(OperationType.OBJECT_REMOVE, OperationType.OBJECT_SET, ObjectRemovePropertySetPropertyOTF);
    this.registerOtf(OperationType.OBJECT_REMOVE, OperationType.OBJECT_REMOVE, ObjectRemovePropertyRemovePropertyOTF);
    this.registerOtf(OperationType.OBJECT_REMOVE, OperationType.OBJECT_VALUE, ObjectRemovePropertySetOTF);

    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_ADD, ObjectSetPropertyAddPropertyOTF);
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_SET, ObjectSetPropertySetPropertyOTF);
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_REMOVE, ObjectSetPropertyRemovePropertyOTF);
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_VALUE, ObjectSetPropertySetOTF);

    this.registerOtf(OperationType.OBJECT_VALUE, OperationType.OBJECT_ADD, ObjectSetAddPropertyOTF);
    this.registerOtf(OperationType.OBJECT_VALUE, OperationType.OBJECT_SET, ObjectSetSetPropertyOTF);
    this.registerOtf(OperationType.OBJECT_VALUE, OperationType.OBJECT_REMOVE, ObjectSetRemovePropertyOTF);
    this.registerOtf(OperationType.OBJECT_VALUE, OperationType.OBJECT_VALUE, ObjectSetSetOTF);

    // array Functions
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_INSERT, ArrayInsertInsertOTF);
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_REMOVE, ArrayInsertRemoveOTF);
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_SET, ArrayInsertReplaceOTF);
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_REORDER, ArrayInsertMoveOTF);
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_VALUE, ArrayInsertSetOTF);

    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_INSERT, ArrayRemoveInsertOTF);
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_REMOVE, ArrayRemoveRemoveOTF);
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_SET, ArrayRemoveReplaceOTF);
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_REORDER, ArrayRemoveMoveOTF);
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_VALUE, ArrayRemoveSetOTF);

    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_INSERT, ArrayReplaceInsertOTF);
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_REMOVE, ArrayReplaceRemoveOTF);
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_SET, ArrayReplaceReplaceOTF);
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_REORDER, ArrayReplaceMoveOTF);
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_VALUE, ArrayReplaceSetOTF);

    this.registerOtf(OperationType.ARRAY_REORDER, OperationType.ARRAY_INSERT, ArrayMoveInsertOTF);
    this.registerOtf(OperationType.ARRAY_REORDER, OperationType.ARRAY_REMOVE, ArrayMoveRemoveOTF);
    this.registerOtf(OperationType.ARRAY_REORDER, OperationType.ARRAY_SET, ArrayMoveReplaceOTF);
    this.registerOtf(OperationType.ARRAY_REORDER, OperationType.ARRAY_REORDER, ArrayMoveMoveOTF);
    this.registerOtf(OperationType.ARRAY_REORDER, OperationType.ARRAY_VALUE, ArrayMoveSetOTF);

    this.registerOtf(OperationType.ARRAY_VALUE, OperationType.ARRAY_INSERT, ArraySetInsertOTF);
    this.registerOtf(OperationType.ARRAY_VALUE, OperationType.ARRAY_REMOVE, ArraySetRemoveOTF);
    this.registerOtf(OperationType.ARRAY_VALUE, OperationType.ARRAY_SET, ArraySetReplaceOTF);
    this.registerOtf(OperationType.ARRAY_VALUE, OperationType.ARRAY_REORDER, ArraySetMoveOTF);
    this.registerOtf(OperationType.ARRAY_VALUE, OperationType.ARRAY_VALUE, ArraySetSetOTF);

    // number Functions
    this.registerOtf(OperationType.NUMBER_DELTA, OperationType.NUMBER_DELTA, NumberAddAddOTF);
    this.registerOtf(OperationType.NUMBER_DELTA, OperationType.NUMBER_VALUE, NumberAddSetOTF);

    this.registerOtf(OperationType.NUMBER_VALUE, OperationType.NUMBER_DELTA, NumberSetAddOTF);
    this.registerOtf(OperationType.NUMBER_VALUE, OperationType.NUMBER_VALUE, NumberSetSetOTF);

    // boolean Functions
    this.registerOtf(OperationType.BOOLEAN_VALUE, OperationType.BOOLEAN_VALUE, BooleanSetSetOTF);

    // date Functions
    this.registerOtf(OperationType.DATE_VALUE, OperationType.DATE_VALUE, DateSetSetOTF);

    //
    // Reference Transformation Functions
    //
    this.registerRtf(ModelReference.Types.INDEX, OperationType.STRING_INSERT, StringInsertIndexTransformationFunction);
    this.registerRtf(ModelReference.Types.INDEX, OperationType.STRING_REMOVE, StringRemoveIndexTransformationFunction);
    this.registerRtf(ModelReference.Types.INDEX, OperationType.STRING_VALUE, StringSetIndexTransformationFunction);

    this.registerRtf(ModelReference.Types.RANGE, OperationType.STRING_INSERT, StringInsertRangeTransformationFunction);
    this.registerRtf(ModelReference.Types.RANGE, OperationType.STRING_REMOVE, StringRemoveRangeTransformationFunction);
    this.registerRtf(ModelReference.Types.RANGE, OperationType.STRING_VALUE, StringSetRangeTransformationFunction);
  }

  // tslint:disable-next-line: max-line-length
  public registerOtf<S extends DiscreteOperation, C extends DiscreteOperation>(s: string, c: string, otf: OperationTransformationFunction<S, C>): void {
    const key: string = s + c;
    if (this._otfs[key]) {
      throw new Error("Function already registered for " + s + ", " + c);
    } else {
      this._otfs[key] = otf;
    }
  }

  public registerRtf<S extends DiscreteOperation>(r: string, s: string, rtf: ReferenceTransformationFunction): void {
    const key: string = s + r;
    if (this._rtfs[key]) {
      throw new Error("Function already registered for " + s + ", " + r);
    } else {
      this._rtfs[key] = rtf;
    }
  }

  public getOperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation>(s: S, c: C):
  OperationTransformationFunction<S, C> {
    const key: string = s.type + c.type;
    return this._otfs[key];
  }

  public getReferenceTransformationFunction<O extends DiscreteOperation>(o: O, r: ModelReferenceData):
  ReferenceTransformationFunction {
    const key: string = o.type + r.type;
    return this._rtfs[key];
  }
}

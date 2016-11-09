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
import {ReferenceType} from "../../reference/ModelReference";
import {StringInsertIndexTransformationFunction} from "./reference/IndexTransformationFunctions";
import {OperationType} from "../ops/OperationType";
import {StringRemoveIndexTransformationFunction} from "./reference/IndexTransformationFunctions";
import {StringSetIndexTransformationFunction} from "./reference/IndexTransformationFunctions";
import {StringInsertRangeTransformationFunction} from "./reference/RangeTransformationFunctions";
import {StringRemoveRangeTransformationFunction} from "./reference/RangeTransformationFunctions";
import {StringSetRangeTransformationFunction} from "./reference/RangeTransformationFunctions";

export class TransformationFunctionRegistry {
  private _otfs: {[key: string]: OperationTransformationFunction<any, any>};
  private _rtfs: {[key: string]: ReferenceTransformationFunction};

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
    this.registerOtf(OperationType.NUMBER_ADD, OperationType.NUMBER_ADD, NumberAddAddOTF);
    this.registerOtf(OperationType.NUMBER_ADD, OperationType.NUMBER_VALUE, NumberAddSetOTF);

    this.registerOtf(OperationType.NUMBER_VALUE, OperationType.NUMBER_ADD, NumberSetAddOTF);
    this.registerOtf(OperationType.NUMBER_VALUE, OperationType.NUMBER_VALUE, NumberSetSetOTF);

    // boolean Functions
    this.registerOtf(OperationType.BOOLEAN_VALUE, OperationType.BOOLEAN_VALUE, BooleanSetSetOTF);

    //
    // Reference Transformation Functions
    //
    this.registerRtf(ReferenceType.INDEX, OperationType.STRING_INSERT, StringInsertIndexTransformationFunction);
    this.registerRtf(ReferenceType.INDEX, OperationType.STRING_REMOVE, StringRemoveIndexTransformationFunction);
    this.registerRtf(ReferenceType.INDEX, OperationType.STRING_VALUE, StringSetIndexTransformationFunction);

    this.registerRtf(ReferenceType.RANGE, OperationType.STRING_INSERT, StringInsertRangeTransformationFunction);
    this.registerRtf(ReferenceType.RANGE, OperationType.STRING_REMOVE, StringRemoveRangeTransformationFunction);
    this.registerRtf(ReferenceType.RANGE, OperationType.STRING_VALUE, StringSetRangeTransformationFunction);
  }

  public registerOtf<S extends DiscreteOperation, C extends DiscreteOperation>
  (s: string, c: string, otf: OperationTransformationFunction<S, C>): void {
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

  public getOperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation>
  (s: S, c: C): OperationTransformationFunction<S, C> {
    const key: string = s.type + c.type;
    return this._otfs[key];
  }

  public getReferenceTransformationFunction<O extends DiscreteOperation>
  (o: O, r: ModelReferenceData): ReferenceTransformationFunction {
    const key: string = o.type + r.type;
    return this._rtfs[key];
  }
}

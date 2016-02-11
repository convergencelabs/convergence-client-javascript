import DiscreteOperation from "../ops/DiscreteOperation";
import OperationTransformationFunction from "./OperationTransformationFunction";
import {PathTransformationFunction} from "./PathTransformationFunction";
import ArrayInsertInsertOTF from "./array/ArrayInsertInsertOTF";
import ArrayInsertRemoveOTF from "./array/ArrayInsertRemoveOTF";
import ArrayInsertReplaceOTF from "./array/ArrayInsertReplaceOTF";
import ArrayInsertMoveOTF from "./array/ArrayInsertMoveOTF";
import ArrayInsertSetOTF from "./array/ArrayInsertSetOTF";
import ArrayRemoveInsertOTF from "./array/ArrayRemoveInsertOTF";
import ArrayRemoveRemoveOTF from "./array/ArrayRemoveRemoveOTF";
import ArrayRemoveReplaceOTF from "./array/ArrayRemoveReplaceOTF";
import ArrayRemoveMoveOTF from "./array/ArrayRemoveMoveOTF";
import ArrayRemoveSetOTF from "./array/ArrayRemoveSetOTF";
import ArrayReplaceInsertOTF from "./array/ArrayReplaceInsertOTF";
import ArrayReplaceRemoveOTF from "./array/ArrayReplaceRemoveOTF";
import ArrayReplaceReplaceOTF from "./array/ArrayReplaceReplaceOTF";
import ArrayReplaceMoveOTF from "./array/ArrayReplaceMoveOTF";
import ArrayReplaceSetOTF from "./array/ArrayReplaceSetOTF";
import ArrayMoveInsertOTF from "./array/ArrayMoveInsertOTF";
import ArrayMoveRemoveOTF from "./array/ArrayMoveRemoveOTF";
import ArrayMoveReplaceOTF from "./array/ArrayMoveReplaceOTF";
import ArrayMoveMoveOTF from "./array/ArrayMoveMoveOTF";
import ArrayMoveSetOTF from "./array/ArrayMoveSetOTF";
import ArraySetInsertOTF from "./array/ArraySetInsertOTF";
import ArraySetRemoveOTF from "./array/ArraySetRemoveOTF";
import ArraySetReplaceOTF from "./array/ArraySetReplaceOTF";
import ArraySetMoveOTF from "./array/ArraySetMoveOTF";
import ArraySetSetOTF from "./array/ArraySetSetOTF";
import StringInsertInsertOTF from "./string/StringInsertInsertOTF";
import StringInsertRemoveOTF from "./string/StringInsertRemoveOTF";
import StringInsertSetOTF from "./string/StringInsertSetOTF";
import StringRemoveInsertOTF from "./string/StringRemoveInsertOTF";
import StringRemoveRemoveOTF from "./string/StringRemoveRemoveOTF";
import StringRemoveSetOTF from "./string/StringRemoveSetOTF";
import StringSetInsertOTF from "./string/StringSetInsertOTF";
import StringSetRemoveOTF from "./string/StringSetRemoveOTF";
import StringSetSetOTF from "./string/StringSetSetOTF";
import NumberAddAddOTF from "./number/NumberAddAddOTF";
import NumberAddSetOTF from "./number/NumberAddSetOTF";
import NumberSetAddOTF from "./number/NumberSetAddOTF";
import NumberSetSetOTF from "./number/NumberSetSetOTF";
import BooleanSetSetOTF from "./bool/BooleanSetSetOTF";
import ArrayInsertPTF from "./path/ArrayInsertPTF";
import ObjectAddPropertyAddPropertyOTF from "./object/ObjectAddPropertyAddPropertyOTF";
import ObjectAddPropertySetPropertyOTF from "./object/ObjectAddPropertySetPropertyOTF";
import ObjectAddPropertyRemovePropertyOTF from "./object/ObjectAddPropertyRemovePropertyOTF";
import ObjectRemovePropertyAddPropertyOTF from "./object/ObjectRemovePropertyAddPropertyOTF";
import ObjectRemovePropertySetPropertyOTF from "./object/ObjectRemovePropertySetPropertyOTF";
import ObjectRemovePropertyRemovePropertyOTF from "./object/ObjectRemovePropertyRemovePropertyOTF";
import ObjectAddPropertySetOTF from "./object/ObjectAddPropertySetOTF";
import ObjectRemovePropertySetOTF from "./object/ObjectRemovePropertySetOTF";
import ObjectSetPropertyAddPropertyOTF from "./object/ObjectSetPropertyAddPropertyOTF";
import ObjectSetPropertySetPropertyOTF from "./object/ObjectSetPropertySetPropertyOTF";
import ObjectSetPropertyRemovePropertyOTF from "./object/ObjectSetPropertyRemovePropertyOTF";
import ObjectSetPropertySetOTF from "./object/ObjectSetPropertySetOTF";
import ObjectSetAddPropertyOTF from "./object/ObjectSetAddPropertyOTF";
import ObjectSetSetPropertyOTF from "./object/ObjectSetSetPropertyOTF";
import ObjectSetRemovePropertyOTF from "./object/ObjectSetRemovePropertyOTF";
import ObjectSetSetOTF from "./object/ObjectSetSetOTF";
import ArrayRemovePTF from "./path/ArrayRemovePTF";
import ArrayReplacePTF from "./path/ArrayReplacePTF";
import ArrayMovePTF from "./path/ArrayMovePTF";
import ArraySetPTF from "./path/ArraySetPTF";
import ObjectSetPropertyPTF from "./path/ObjectSetPropertyPTF";
import ObjectRemovePropertyPTF from "./path/ObjectRemovePropertyPTF";
import ObjectSetPTF from "./path/ObjectSetPTF";
import OperationType from "../../protocol/model/OperationType";


export default class TransformationFunctionRegistry {
  otfs: any = {};
  ptfs: any = {};

  constructor() {
    // string Functions
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_INSERT, new StringInsertInsertOTF());
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_REMOVE, new StringInsertRemoveOTF());
    this.registerOtf(OperationType.STRING_INSERT, OperationType.STRING_SET, new StringInsertSetOTF());

    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_INSERT, new StringRemoveInsertOTF());
    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_REMOVE, new StringRemoveRemoveOTF());
    this.registerOtf(OperationType.STRING_REMOVE, OperationType.STRING_SET, new StringRemoveSetOTF());

    this.registerOtf(OperationType.STRING_SET, OperationType.STRING_INSERT, new StringSetInsertOTF());
    this.registerOtf(OperationType.STRING_SET, OperationType.STRING_REMOVE, new StringSetRemoveOTF());
    this.registerOtf(OperationType.STRING_SET, OperationType.STRING_SET, new StringSetSetOTF());

    // object Functions
    this.registerOtf(OperationType.OBJECT_ADD_PROPERTY, OperationType.OBJECT_ADD_PROPERTY, new ObjectAddPropertyAddPropertyOTF());
    this.registerOtf(OperationType.OBJECT_ADD_PROPERTY, OperationType.OBJECT_SET_PROPERTY, new ObjectAddPropertySetPropertyOTF());
    this.registerOtf(OperationType.OBJECT_ADD_PROPERTY, OperationType.OBJECT_REMOVE_PROPERTY, new ObjectAddPropertyRemovePropertyOTF());
    this.registerOtf(OperationType.OBJECT_ADD_PROPERTY, OperationType.OBJECT_SET, new ObjectAddPropertySetOTF());

    this.registerOtf(OperationType.OBJECT_REMOVE_PROPERTY, OperationType.OBJECT_ADD_PROPERTY, new ObjectRemovePropertyAddPropertyOTF());
    this.registerOtf(OperationType.OBJECT_REMOVE_PROPERTY, OperationType.OBJECT_SET_PROPERTY, new ObjectRemovePropertySetPropertyOTF());
    this.registerOtf(
      OperationType.OBJECT_REMOVE_PROPERTY,
      OperationType.OBJECT_REMOVE_PROPERTY,
      new ObjectRemovePropertyRemovePropertyOTF());
    this.registerOtf(OperationType.OBJECT_REMOVE_PROPERTY, OperationType.OBJECT_SET, new ObjectRemovePropertySetOTF());

    this.registerOtf(OperationType.OBJECT_SET_PROPERTY, OperationType.OBJECT_ADD_PROPERTY, new ObjectSetPropertyAddPropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET_PROPERTY, OperationType.OBJECT_SET_PROPERTY, new ObjectSetPropertySetPropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET_PROPERTY, OperationType.OBJECT_REMOVE_PROPERTY, new ObjectSetPropertyRemovePropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET_PROPERTY, OperationType.OBJECT_SET, new ObjectSetPropertySetOTF());

    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_ADD_PROPERTY, new ObjectSetAddPropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_SET_PROPERTY, new ObjectSetSetPropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_REMOVE_PROPERTY, new ObjectSetRemovePropertyOTF());
    this.registerOtf(OperationType.OBJECT_SET, OperationType.OBJECT_SET, new ObjectSetSetOTF());

    // array Functions
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_INSERT, new ArrayInsertInsertOTF());
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_REMOVE, new ArrayInsertRemoveOTF());
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_REPLACE, new ArrayInsertReplaceOTF());
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_MOVE, new ArrayInsertMoveOTF());
    this.registerOtf(OperationType.ARRAY_INSERT, OperationType.ARRAY_SET, new ArrayInsertSetOTF());

    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_INSERT, new ArrayRemoveInsertOTF());
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_REMOVE, new ArrayRemoveRemoveOTF());
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_REPLACE, new ArrayRemoveReplaceOTF());
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_MOVE, new ArrayRemoveMoveOTF());
    this.registerOtf(OperationType.ARRAY_REMOVE, OperationType.ARRAY_SET, new ArrayRemoveSetOTF());

    this.registerOtf(OperationType.ARRAY_REPLACE, OperationType.ARRAY_INSERT, new ArrayReplaceInsertOTF());
    this.registerOtf(OperationType.ARRAY_REPLACE, OperationType.ARRAY_REMOVE, new ArrayReplaceRemoveOTF());
    this.registerOtf(OperationType.ARRAY_REPLACE, OperationType.ARRAY_REPLACE, new ArrayReplaceReplaceOTF());
    this.registerOtf(OperationType.ARRAY_REPLACE, OperationType.ARRAY_MOVE, new ArrayReplaceMoveOTF());
    this.registerOtf(OperationType.ARRAY_REPLACE, OperationType.ARRAY_SET, new ArrayReplaceSetOTF());

    this.registerOtf(OperationType.ARRAY_MOVE, OperationType.ARRAY_INSERT, new ArrayMoveInsertOTF());
    this.registerOtf(OperationType.ARRAY_MOVE, OperationType.ARRAY_REMOVE, new ArrayMoveRemoveOTF());
    this.registerOtf(OperationType.ARRAY_MOVE, OperationType.ARRAY_REPLACE, new ArrayMoveReplaceOTF());
    this.registerOtf(OperationType.ARRAY_MOVE, OperationType.ARRAY_MOVE, new ArrayMoveMoveOTF());
    this.registerOtf(OperationType.ARRAY_MOVE, OperationType.ARRAY_SET, new ArrayMoveSetOTF());

    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_INSERT, new ArraySetInsertOTF());
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_REMOVE, new ArraySetRemoveOTF());
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_REPLACE, new ArraySetReplaceOTF());
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_MOVE, new ArraySetMoveOTF());
    this.registerOtf(OperationType.ARRAY_SET, OperationType.ARRAY_SET, new ArraySetSetOTF());

    // number Functions
    this.registerOtf(OperationType.NUMBER_ADD, OperationType.NUMBER_ADD, new NumberAddAddOTF());
    this.registerOtf(OperationType.NUMBER_ADD, OperationType.NUMBER_SET, new NumberAddSetOTF());

    this.registerOtf(OperationType.NUMBER_SET, OperationType.NUMBER_ADD, new NumberSetAddOTF());
    this.registerOtf(OperationType.NUMBER_SET, OperationType.NUMBER_SET, new NumberSetSetOTF());

    // boolean Functions
    this.registerOtf(OperationType.BOOLEAN_SET, OperationType.BOOLEAN_SET, new BooleanSetSetOTF());


    //
    // path Transformation Functions
    //

    this.ptfs[OperationType.ARRAY_INSERT] = new ArrayInsertPTF();
    this.ptfs[OperationType.ARRAY_REMOVE] = new ArrayRemovePTF();
    this.ptfs[OperationType.ARRAY_REPLACE] = new ArrayReplacePTF();
    this.ptfs[OperationType.ARRAY_MOVE] = new ArrayMovePTF();
    this.ptfs[OperationType.ARRAY_SET] = new ArraySetPTF();

    this.ptfs[OperationType.OBJECT_SET_PROPERTY] = new ObjectSetPropertyPTF();
    this.ptfs[OperationType.OBJECT_REMOVE_PROPERTY] = new ObjectRemovePropertyPTF();
    this.ptfs[OperationType.OBJECT_SET] = new ObjectSetPTF();
  }

  registerOtf<S extends DiscreteOperation, C extends DiscreteOperation>
  (s: number, c: number, otf: OperationTransformationFunction<S, C>): void {
    var key: string = "" + s + c;
    if (this.otfs[key]) {
      throw new Error("Transformation function already registered for " + s + ", " + c);
    } else {
      this.otfs[key] = otf;
    }
  }

  getOperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation>
  (s: S, c: C): OperationTransformationFunction<S, C> {
    var key: string = "" + s.type + c.type;
    return this.otfs[key];
  }

  getPathTransformationFunction<A extends DiscreteOperation>(a: A): PathTransformationFunction<A> {
    return this.ptfs[a.type];
  }
}

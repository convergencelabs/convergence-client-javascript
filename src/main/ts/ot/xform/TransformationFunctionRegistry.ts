import StringInsertOperation from "../ops/StringInsertOperation";
import StringRemoveOperation from "../ops/StringRemoveOperation";
import StringSetOperation from "../ops/StringSetOperation";
import ObjectAddPropertyOperation from "../ops/ObjectAddPropertyOperation";
import ObjectRemovePropertyOperation from "../ops/ObjectRemovePropertyOperation";
import ObjectSetPropertyOperation from "../ops/ObjectSetPropertyOperation";
import ObjectSetOperation from "../ops/ObjectSetOperation";
import ArrayInsertOperation from "../ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../ops/ArrayReplaceOperation";
import ArrayMoveOperation from "../ops/ArrayMoveOperation";
import ArraySetOperation from "../ops/ArraySetOperation";
import NumberAddOperation from "../ops/NumberAddOperation";
import NumberSetOperation from "../ops/NumberSetOperation";
import BooleanSetOperation from "../ops/BooleanSetOperation";
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


export default class TransformationFunctionRegistry {
  otfs: any = {};
  ptfs: any = {};

  constructor() {
    // string Functions
    this.registerOtf(StringInsertOperation.TYPE, StringInsertOperation.TYPE, new StringInsertInsertOTF());
    this.registerOtf(StringInsertOperation.TYPE, StringRemoveOperation.TYPE, new StringInsertRemoveOTF());
    this.registerOtf(StringInsertOperation.TYPE, StringSetOperation.TYPE, new StringInsertSetOTF());

    this.registerOtf(StringRemoveOperation.TYPE, StringInsertOperation.TYPE, new StringRemoveInsertOTF());
    this.registerOtf(StringRemoveOperation.TYPE, StringRemoveOperation.TYPE, new StringRemoveRemoveOTF());
    this.registerOtf(StringRemoveOperation.TYPE, StringSetOperation.TYPE, new StringRemoveSetOTF());

    this.registerOtf(StringSetOperation.TYPE, StringInsertOperation.TYPE, new StringSetInsertOTF());
    this.registerOtf(StringSetOperation.TYPE, StringRemoveOperation.TYPE, new StringSetRemoveOTF());
    this.registerOtf(StringSetOperation.TYPE, StringSetOperation.TYPE, new StringSetSetOTF());

    // object Functions
    this.registerOtf(ObjectAddPropertyOperation.TYPE, ObjectAddPropertyOperation.TYPE, new ObjectAddPropertyAddPropertyOTF());
    this.registerOtf(ObjectAddPropertyOperation.TYPE, ObjectSetPropertyOperation.TYPE, new ObjectAddPropertySetPropertyOTF());
    this.registerOtf(ObjectAddPropertyOperation.TYPE, ObjectRemovePropertyOperation.TYPE, new ObjectAddPropertyRemovePropertyOTF());
    this.registerOtf(ObjectAddPropertyOperation.TYPE, ObjectSetOperation.TYPE, new ObjectAddPropertySetOTF());

    this.registerOtf(ObjectRemovePropertyOperation.TYPE, ObjectAddPropertyOperation.TYPE, new ObjectRemovePropertyAddPropertyOTF());
    this.registerOtf(ObjectRemovePropertyOperation.TYPE, ObjectSetPropertyOperation.TYPE, new ObjectRemovePropertySetPropertyOTF());
    this.registerOtf(ObjectRemovePropertyOperation.TYPE, ObjectRemovePropertyOperation.TYPE, new ObjectRemovePropertyRemovePropertyOTF());
    this.registerOtf(ObjectRemovePropertyOperation.TYPE, ObjectSetOperation.TYPE, new ObjectRemovePropertySetOTF());

    this.registerOtf(ObjectSetPropertyOperation.TYPE, ObjectAddPropertyOperation.TYPE, new ObjectSetPropertyAddPropertyOTF());
    this.registerOtf(ObjectSetPropertyOperation.TYPE, ObjectSetPropertyOperation.TYPE, new ObjectSetPropertySetPropertyOTF());
    this.registerOtf(ObjectSetPropertyOperation.TYPE, ObjectRemovePropertyOperation.TYPE, new ObjectSetPropertyRemovePropertyOTF());
    this.registerOtf(ObjectSetPropertyOperation.TYPE, ObjectSetOperation.TYPE, new ObjectSetPropertySetOTF());

    this.registerOtf(ObjectSetOperation.TYPE, ObjectAddPropertyOperation.TYPE, new ObjectSetAddPropertyOTF());
    this.registerOtf(ObjectSetOperation.TYPE, ObjectSetPropertyOperation.TYPE, new ObjectSetSetPropertyOTF());
    this.registerOtf(ObjectSetOperation.TYPE, ObjectRemovePropertyOperation.TYPE, new ObjectSetRemovePropertyOTF());
    this.registerOtf(ObjectSetOperation.TYPE, ObjectSetOperation.TYPE, new ObjectSetSetOTF());

    // array Functions
    this.registerOtf(ArrayInsertOperation.TYPE, ArrayInsertOperation.TYPE, new ArrayInsertInsertOTF());
    this.registerOtf(ArrayInsertOperation.TYPE, ArrayRemoveOperation.TYPE, new ArrayInsertRemoveOTF());
    this.registerOtf(ArrayInsertOperation.TYPE, ArrayReplaceOperation.TYPE, new ArrayInsertReplaceOTF());
    this.registerOtf(ArrayInsertOperation.TYPE, ArrayMoveOperation.TYPE, new ArrayInsertMoveOTF());
    this.registerOtf(ArrayInsertOperation.TYPE, ArraySetOperation.TYPE, new ArrayInsertSetOTF());

    this.registerOtf(ArrayRemoveOperation.TYPE, ArrayInsertOperation.TYPE, new ArrayRemoveInsertOTF());
    this.registerOtf(ArrayRemoveOperation.TYPE, ArrayRemoveOperation.TYPE, new ArrayRemoveRemoveOTF());
    this.registerOtf(ArrayRemoveOperation.TYPE, ArrayReplaceOperation.TYPE, new ArrayRemoveReplaceOTF());
    this.registerOtf(ArrayRemoveOperation.TYPE, ArrayMoveOperation.TYPE, new ArrayRemoveMoveOTF());
    this.registerOtf(ArrayRemoveOperation.TYPE, ArraySetOperation.TYPE, new ArrayRemoveSetOTF());

    this.registerOtf(ArrayReplaceOperation.TYPE, ArrayInsertOperation.TYPE, new ArrayReplaceInsertOTF());
    this.registerOtf(ArrayReplaceOperation.TYPE, ArrayRemoveOperation.TYPE, new ArrayReplaceRemoveOTF());
    this.registerOtf(ArrayReplaceOperation.TYPE, ArrayReplaceOperation.TYPE, new ArrayReplaceReplaceOTF());
    this.registerOtf(ArrayReplaceOperation.TYPE, ArrayMoveOperation.TYPE, new ArrayReplaceMoveOTF());
    this.registerOtf(ArrayReplaceOperation.TYPE, ArraySetOperation.TYPE, new ArrayReplaceSetOTF());

    this.registerOtf(ArrayMoveOperation.TYPE, ArrayInsertOperation.TYPE, new ArrayMoveInsertOTF());
    this.registerOtf(ArrayMoveOperation.TYPE, ArrayRemoveOperation.TYPE, new ArrayMoveRemoveOTF());
    this.registerOtf(ArrayMoveOperation.TYPE, ArrayReplaceOperation.TYPE, new ArrayMoveReplaceOTF());
    this.registerOtf(ArrayMoveOperation.TYPE, ArrayMoveOperation.TYPE, new ArrayMoveMoveOTF());
    this.registerOtf(ArrayMoveOperation.TYPE, ArraySetOperation.TYPE, new ArrayMoveSetOTF());

    this.registerOtf(ArraySetOperation.TYPE, ArrayInsertOperation.TYPE, new ArraySetInsertOTF());
    this.registerOtf(ArraySetOperation.TYPE, ArrayRemoveOperation.TYPE, new ArraySetRemoveOTF());
    this.registerOtf(ArraySetOperation.TYPE, ArrayReplaceOperation.TYPE, new ArraySetReplaceOTF());
    this.registerOtf(ArraySetOperation.TYPE, ArrayMoveOperation.TYPE, new ArraySetMoveOTF());
    this.registerOtf(ArraySetOperation.TYPE, ArraySetOperation.TYPE, new ArraySetSetOTF());

    // number Functions
    this.registerOtf(NumberAddOperation.TYPE, NumberAddOperation.TYPE, new NumberAddAddOTF());
    this.registerOtf(NumberAddOperation.TYPE, NumberSetOperation.TYPE, new NumberAddSetOTF());

    this.registerOtf(NumberSetOperation.TYPE, NumberAddOperation.TYPE, new NumberSetAddOTF());
    this.registerOtf(NumberSetOperation.TYPE, NumberSetOperation.TYPE, new NumberSetSetOTF());

    // boolean Functions
    this.registerOtf(BooleanSetOperation.TYPE, BooleanSetOperation.TYPE, new BooleanSetSetOTF());


    //
    // path Transformation Functions
    //

    this.ptfs[ArrayInsertOperation.TYPE] = new ArrayInsertPTF();
    this.ptfs[ArrayRemoveOperation.TYPE] = new ArrayRemovePTF();
    this.ptfs[ArrayReplaceOperation.TYPE] = new ArrayReplacePTF();
    this.ptfs[ArrayMoveOperation.TYPE] = new ArrayMovePTF();
    this.ptfs[ArraySetOperation.TYPE] = new ArraySetPTF();

    this.ptfs[ObjectSetPropertyOperation.TYPE] = new ObjectSetPropertyPTF();
    this.ptfs[ObjectRemovePropertyOperation.TYPE] = new ObjectRemovePropertyPTF();
    this.ptfs[ObjectSetOperation.TYPE] = new ObjectSetPTF();
  }

  registerOtf<S extends DiscreteOperation, C extends DiscreteOperation>(s: string, c: string, otf: OperationTransformationFunction<S, C>): void {
    var key: string = s + c;
    if (this.otfs[key]) {
      throw new Error("Transformation function already registered for " + s + ", " + c);
    } else {
      this.otfs[key] = otf;
    }
  }

  getOperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation>(s: S, c: C): OperationTransformationFunction<S, C> {
    var key: string = s.type + c.type;
    return this.otfs[key];
  }

  getPathTransformationFunction<A extends DiscreteOperation>(a: A): PathTransformationFunction<A> {
    return this.ptfs[a.type];
  }
}

/// <reference path="OperationTransformationFunction.ts" />
/// <reference path="../ops/StringInsertOperation.ts" />
/// <reference path="../ops/StringRemoveOperation.ts" />
/// <reference path="../ops/StringSetOperation.ts" />

module convergence.ot {
  export class TransformationFunctionRegistry {
    otfs:any = {};
    ptfs:any = {};

    constructor() {
      // String Functions
      this.registerOtf(StringInsertOperation.TYPE, StringInsertOperation.TYPE, new StringInsertInsertOTF());
      this.registerOtf(StringInsertOperation.TYPE, StringRemoveOperation.TYPE, new StringInsertRemoveOTF());
      this.registerOtf(StringInsertOperation.TYPE, StringSetOperation.TYPE, new StringInsertSetOTF());

      this.registerOtf(StringRemoveOperation.TYPE, StringInsertOperation.TYPE, new StringRemoveInsertOTF());
      this.registerOtf(StringRemoveOperation.TYPE, StringRemoveOperation.TYPE, new StringRemoveRemoveOTF());
      this.registerOtf(StringRemoveOperation.TYPE, StringSetOperation.TYPE, new StringRemoveSetOTF());

      this.registerOtf(StringSetOperation.TYPE, StringInsertOperation.TYPE, new StringSetInsertOTF());
      this.registerOtf(StringSetOperation.TYPE, StringRemoveOperation.TYPE, new StringSetRemoveOTF());
      this.registerOtf(StringSetOperation.TYPE, StringSetOperation.TYPE, new StringSetSetOTF());

      // Object Functions
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

      // Array Functions
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

      // Number Functions
      this.registerOtf(NumberAddOperation.TYPE, NumberAddOperation.TYPE, new NumberAddAddOTF());
      this.registerOtf(NumberAddOperation.TYPE, NumberSetOperation.TYPE, new NumberAddSetOTF());

      this.registerOtf(NumberSetOperation.TYPE, NumberAddOperation.TYPE, new NumberSetAddOTF());
      this.registerOtf(NumberSetOperation.TYPE, NumberSetOperation.TYPE, new NumberSetSetOTF());

      // Boolean Functions
      this.registerOtf(BooleanSetOperation.TYPE, BooleanSetOperation.TYPE, new BooleanSetSetOTF());


      //
      // Path Transformation Functions
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

    registerOtf<S extends DiscreteOperation, C extends DiscreteOperation>(s:string, c:string, otf:OperationTransformationFunction<S, C>):void {
      var key:string = s + c;
      if (this.otfs[key]) {
        throw new Error("Transformation function already registered for " + s + ", " + c);
      } else {
        this.otfs[key] = otf;
      }
    }

    getOperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation>(s:S, c:C):OperationTransformationFunction<S, C> {
      var key:string = s.type() + c.type();
      return this.otfs[key]
    }

    getPathTransformationFunction<A extends DiscreteOperation>(a:A):PathTransformationFunction<A> {
      return this.ptfs[a.type()]
    }
  }
}

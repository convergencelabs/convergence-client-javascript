import Operation from "../../../model/ot/ops/Operation";
import ArrayInsertOperation from "../../../model/ot/ops/ArrayInsertOperation";
import CompoundOperation from "../../../model/ot/ops/CompoundOperation";
import ArrayMoveOperation from "../../../model/ot/ops/ArrayMoveOperation";
import ArrayRemoveOperation from "../../../model/ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../../../model/ot/ops/ArrayReplaceOperation";
import ArraySetOperation from "../../../model/ot/ops/ArraySetOperation";
import BooleanSetOperation from "../../../model/ot/ops/BooleanSetOperation";
import NumberAddOperation from "../../../model/ot/ops/NumberAddOperation";
import NumberSetOperation from "../../../model/ot/ops/NumberSetOperation";
import ObjectAddPropertyOperation from "../../../model/ot/ops/ObjectAddPropertyOperation";
import ObjectRemovePropertyOperation from "../../../model/ot/ops/ObjectRemovePropertyOperation";
import ObjectSetPropertyOperation from "../../../model/ot/ops/ObjectSetPropertyOperation";
import ObjectSetOperation from "../../../model/ot/ops/ObjectSetOperation";
import StringInsertOperation from "../../../model/ot/ops/StringInsertOperation";
import StringRemoveOperation from "../../../model/ot/ops/StringRemoveOperation";
import StringSetOperation from "../../../model/ot/ops/StringSetOperation";
import DiscreteOperation from "../../../model/ot/ops/DiscreteOperation";
import {OperationType} from "../../../model/ot/ops/OperationType";
import {CodeMap} from "../../../util/CodeMap";
import {DataValueSerializer} from "./dataValue";
import {mapObject} from "../../../util/ObjectUtils";
import {DataValue} from "../../../model/dataValue";
import {DataValueDeserializer} from "./dataValue";


var OperationTypeCodes: CodeMap = new CodeMap();
OperationTypeCodes.put(0, OperationType.COMPOUND);
OperationTypeCodes.put(1, OperationType.ARRAY_INSERT);
OperationTypeCodes.put(2, OperationType.ARRAY_REORDER);
OperationTypeCodes.put(3, OperationType.ARRAY_REMOVE);
OperationTypeCodes.put(4, OperationType.ARRAY_SET);
OperationTypeCodes.put(5, OperationType.ARRAY_VALUE);
OperationTypeCodes.put(6, OperationType.BOOLEAN_VALUE);
OperationTypeCodes.put(7, OperationType.NUMBER_ADD);
OperationTypeCodes.put(8, OperationType.NUMBER_VALUE);
OperationTypeCodes.put(9, OperationType.OBJECT_ADD);
OperationTypeCodes.put(10, OperationType.OBJECT_REMOVE);
OperationTypeCodes.put(11, OperationType.OBJECT_SET);
OperationTypeCodes.put(12, OperationType.OBJECT_VALUE);
OperationTypeCodes.put(13, OperationType.STRING_INSERT);
OperationTypeCodes.put(14, OperationType.STRING_REMOVE);
OperationTypeCodes.put(15, OperationType.STRING_VALUE);

export class OperationSerializer {
  static serialize(operation: Operation): any {
    if (operation instanceof CompoundOperation) {
      return CompoundOperationSerializer.serialize(operation);
    } else if (operation instanceof DiscreteOperation) {
      return DiscreteOperationSerializer.serialize(operation);
    }
  }
}

export class OperationDeserializer {
  static deserialize(body: any): Operation {
    switch (OperationTypeCodes.value(body.t)) {
      case OperationType.COMPOUND:
        return CompoundDeserializer.deserialize(body);
      default:
        return DiscreteOperationDeserializer.deserialize(body);
    }
  }
}

export class DiscreteOperationSerializer {
  static serialize(operation: DiscreteOperation): any {
    if (operation instanceof ArrayInsertOperation) {
      return ArrayInsertOperationSerializer.serialize(operation);
    } else if (operation instanceof ArrayMoveOperation) {
      return ArrayMoveOperationSerializer.serialize(operation);
    } else if (operation instanceof ArrayRemoveOperation) {
      return ArrayRemoveOperationSerializer.serialize(operation);
    } else if (operation instanceof ArrayReplaceOperation) {
      return ArrayReplaceOperationSerializer.serialize(operation);
    } else if (operation instanceof ArraySetOperation) {
      return ArraySetOperationSerializer.serialize(operation);
    } else if (operation instanceof BooleanSetOperation) {
      return BooleanSetOperationSerializer.serialize(operation);
    } else if (operation instanceof NumberAddOperation) {
      return NumberAddOperationSerializer.serialize(operation);
    } else if (operation instanceof NumberSetOperation) {
      return NumberSetOperationSerializer.serialize(operation);
    } else if (operation instanceof ObjectAddPropertyOperation) {
      return ObjectAddPropertyOperationSerializer.serialize(operation);
    } else if (operation instanceof ObjectRemovePropertyOperation) {
      return ObjectRemovePropertyOperationSerializer.serialize(operation);
    } else if (operation instanceof ObjectSetPropertyOperation) {
      return ObjectSetPropertyOperationSerializer.serialize(operation);
    } else if (operation instanceof ObjectSetOperation) {
      return ObjectSetOperationSerializer.serialize(operation);
    } else if (operation instanceof StringInsertOperation) {
      return StringInsertOperationSerializer.serialize(operation);
    } else if (operation instanceof StringRemoveOperation) {
      return StringRemoveOperationSerializer.serialize(operation);
    } else if (operation instanceof StringSetOperation) {
      return StringSetOperationSerializer.serialize(operation);
    }
  }
}

export class DiscreteOperationDeserializer {
  static deserialize(body: any): DiscreteOperation {
    switch (OperationTypeCodes.value(body.t)) {
      case OperationType.ARRAY_INSERT:
        return ArrayInsertOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REORDER:
        return ArrayMoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REMOVE:
        return ArrayRemoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_SET:
        return ArrayReplaceOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_VALUE:
        return ArraySetOperationDeserializer.deserialize(body);
      case OperationType.BOOLEAN_VALUE:
        return BooleanSetOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_ADD:
        return NumberAddOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_VALUE:
        return NumberSetOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_ADD:
        return ObjectAddPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_REMOVE:
        return ObjectRemovePropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_SET:
        return ObjectSetPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_VALUE:
        return ObjectSetOperationDeserializer.deserialize(body);
      case OperationType.STRING_INSERT:
        return StringInsertOperationDeserializer.deserialize(body);
      case OperationType.STRING_REMOVE:
        return StringRemoveOperationDeserializer.deserialize(body);
      case OperationType.STRING_VALUE:
        return StringSetOperationDeserializer.deserialize(body);
      default:
        throw new Error("Can't deserialize operation:  unknown operation type");
    }
  }
}


export class CompoundOperationSerializer {
  static serialize(operation: CompoundOperation): any {
    var ops: Array<any> = [];
    var op: DiscreteOperation;

    for (op of operation.ops) {
      ops.push(DiscreteOperationSerializer.serialize(op));
    }
    return {
      t: OperationTypeCodes.code(OperationType.COMPOUND),
      o: ops
    };
  }
}

export class CompoundDeserializer {
  static deserialize(body: any): CompoundOperation {
    var ops: Array<DiscreteOperation> = [];
    var op: any;
    for (op of body.ops) {
      ops.push(DiscreteOperationDeserializer.deserialize(op));
    }
    return new CompoundOperation(ops);
  }
}

export class ArrayInsertOperationSerializer {
  static serialize(operation: ArrayInsertOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.ARRAY_INSERT),
      d: operation.id,
      n: operation.noOp,
      i: operation.index,
      v: DataValueSerializer(operation.value)
    };
  }
}

export class ArrayInsertOperationDeserializer {
  static deserialize(body: any): ArrayInsertOperation {
    return new ArrayInsertOperation(body.d, body.n, body.i, DataValueDeserializer(body.v));
  }
}

export class ArrayMoveOperationSerializer {
  static serialize(operation: ArrayMoveOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.ARRAY_REORDER),
      d: operation.id,
      n: operation.noOp,
      f: operation.fromIndex,
      o: operation.toIndex
    };
  }
}

export class ArrayMoveOperationDeserializer {
  static deserialize(body: any): ArrayMoveOperation {
    return new ArrayMoveOperation(body.d, body.n, body.f, body.o);
  }
}

export class ArrayRemoveOperationSerializer {
  static serialize(operation: ArrayRemoveOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.ARRAY_REMOVE),
      d: operation.id,
      n: operation.noOp,
      i: operation.index
    };
  }
}

export class ArrayRemoveOperationDeserializer {
  static deserialize(body: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(body.d, body.n, body.i);
  }
}

export class ArrayReplaceOperationSerializer {
  static serialize(operation: ArrayReplaceOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.ARRAY_SET),
      d: operation.id,
      n: operation.noOp,
      i: operation.index,
      v: DataValueSerializer(operation.value)
    };
  }
}

export class ArrayReplaceOperationDeserializer {
  static deserialize(body: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(body.d, body.n, body.i, DataValueDeserializer(body.v));
  }
}

export class ArraySetOperationSerializer {
  static serialize(operation: ArraySetOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.ARRAY_VALUE),
      d: operation.id,
      n: operation.noOp,
      v: operation.value.map((value: DataValue) => DataValueSerializer(value))
    };
  }
}

export class ArraySetOperationDeserializer {
  static deserialize(body: any): ArraySetOperation {
    return new ArraySetOperation(body.d, body.n, body.v.map((value: any) => DataValueDeserializer(value)));
  }
}

export class BooleanSetOperationSerializer {
  static serialize(operation: BooleanSetOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.BOOLEAN_VALUE),
      d: operation.id,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class BooleanSetOperationDeserializer {
  static deserialize(body: any): BooleanSetOperation {
    return new BooleanSetOperation(body.d, body.n, body.v);
  }
}

export class NumberAddOperationSerializer {
  static serialize(operation: NumberAddOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.NUMBER_ADD),
      d: operation.id,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class NumberAddOperationDeserializer {
  static deserialize(body: any): NumberAddOperation {
    return new NumberAddOperation(body.d, body.n, body.v);
  }
}

export class NumberSetOperationSerializer {
  static serialize(operation: NumberSetOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.NUMBER_VALUE),
      d: operation.id,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class NumberSetOperationDeserializer {
  static deserialize(body: any): NumberSetOperation {
    return new NumberSetOperation(body.d, body.n, body.v);
  }
}

export class ObjectAddPropertyOperationSerializer {
  static serialize(operation: ObjectAddPropertyOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.OBJECT_ADD),
      d: operation.id,
      n: operation.noOp,
      k: operation.prop,
      v: DataValueSerializer(operation.value)
    };
  }
}

export class ObjectAddPropertyOperationDeserializer {
  static deserialize(body: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(body.d, body.n, body.k, DataValueDeserializer(body.v));
  }
}

export class ObjectRemovePropertyOperationSerializer {
  static serialize(operation: ObjectRemovePropertyOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.OBJECT_REMOVE),
      d: operation.id,
      n: operation.noOp,
      k: operation.prop
    };
  }
}

export class ObjectRemovePropertyOperationDeserializer {
  static deserialize(body: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(body.d, body.n, body.k);
  }
}

export class ObjectSetPropertyOperationSerializer {
  static serialize(operation: ObjectSetPropertyOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.OBJECT_SET),
      d: operation.id,
      n: operation.noOp,
      k: operation.prop,
      v: DataValueSerializer(operation.value)
    };
  }
}

export class ObjectSetPropertyOperationDeserializer {
  static deserialize(body: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(body.d, body.n, body.k, DataValueDeserializer(body.v));
  }
}

export class ObjectSetOperationSerializer {
  static serialize(operation: ObjectSetOperation): any {
    return {
      t: "" + OperationTypeCodes.code(OperationType.OBJECT_VALUE),
      d: operation.id,
      n: operation.noOp,
      v: mapObject(operation.value, (value: DataValue) => DataValueSerializer(value))
    };
  }
}

export class ObjectSetOperationDeserializer {
  static deserialize(body: any): ObjectSetOperation {
    return new ObjectSetOperation(body.d, body.n, mapObject(body.v, (value: any) => DataValueDeserializer(value)));
  }
}

export class StringInsertOperationSerializer {
  static serialize(operation: StringInsertOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.STRING_INSERT),
      d: operation.id,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class StringInsertOperationDeserializer {
  static deserialize(body: any): StringInsertOperation {
    return new StringInsertOperation(body.d, body.n, body.i, body.v);
  }
}

export class StringRemoveOperationSerializer {
  static serialize(operation: StringRemoveOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.STRING_REMOVE),
      d: operation.id,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class StringRemoveOperationDeserializer {
  static deserialize(body: any): StringRemoveOperation {
    return new StringRemoveOperation(body.d, body.n, body.i, body.v);
  }
}

export class StringSetOperationSerializer {
  static serialize(operation: StringSetOperation): any {
    return {
      t: OperationTypeCodes.code(OperationType.STRING_VALUE),
      d: operation.id,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class StringSetOperationDeserializer {
  static deserialize(body: any): StringSetOperation {
    return new StringSetOperation(body.d, body.n, body.v);
  }
}

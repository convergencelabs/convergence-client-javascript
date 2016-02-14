import Operation from "../../ot/ops/Operation";
import ArrayInsertOperation from "../../ot/ops/ArrayInsertOperation";
import CompoundOperation from "../../ot/ops/CompoundOperation";
import ArrayMoveOperation from "../../ot/ops/ArrayMoveOperation";
import ArrayRemoveOperation from "../../ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../../ot/ops/ArrayReplaceOperation";
import ArraySetOperation from "../../ot/ops/ArraySetOperation";
import BooleanSetOperation from "../../ot/ops/BooleanSetOperation";
import NumberAddOperation from "../../ot/ops/NumberAddOperation";
import NumberSetOperation from "../../ot/ops/NumberSetOperation";
import ObjectAddPropertyOperation from "../../ot/ops/ObjectAddPropertyOperation";
import ObjectRemovePropertyOperation from "../../ot/ops/ObjectRemovePropertyOperation";
import ObjectSetPropertyOperation from "../../ot/ops/ObjectSetPropertyOperation";
import ObjectSetOperation from "../../ot/ops/ObjectSetOperation";
import StringInsertOperation from "../../ot/ops/StringInsertOperation";
import StringRemoveOperation from "../../ot/ops/StringRemoveOperation";
import StringSetOperation from "../../ot/ops/StringSetOperation";
import DiscreteOperation from "../../ot/ops/DiscreteOperation";
import OperationType from "./OperationType";

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
    switch (body.t) {
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
    switch (body.t) {
      case OperationType.ARRAY_INSERT:
        return ArrayInsertOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_MOVE:
        return ArrayMoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REMOVE:
        return ArrayRemoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REPLACE:
        return ArrayReplaceOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_SET:
        return ArraySetOperationDeserializer.deserialize(body);
      case OperationType.BOOLEAN_SET:
        return BooleanSetOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_ADD:
        return NumberAddOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_SET:
        return NumberSetOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_ADD_PROPERTY:
        return ObjectAddPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_REMOVE_PROPERTY:
        return ObjectRemovePropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_SET_PROPERTY:
        return ObjectSetPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_SET:
        return ObjectSetOperationDeserializer.deserialize(body);
      case OperationType.STRING_INSERT:
        return StringInsertOperationDeserializer.deserialize(body);
      case OperationType.STRING_REMOVE:
        return StringRemoveOperationDeserializer.deserialize(body);
      case OperationType.STRING_SET:
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
      t: OperationType.COMPOUND,
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
      t: OperationType.ARRAY_INSERT,
      p: operation.path,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class ArrayInsertOperationDeserializer {
  static deserialize(body: any): ArrayInsertOperation {
    return new ArrayInsertOperation(body.p, body.n, body.i, body.v);
  }
}

export class ArrayMoveOperationSerializer {
  static serialize(operation: ArrayMoveOperation): any {
    return {
      t: OperationType.ARRAY_MOVE,
      p: operation.path,
      n: operation.noOp,
      f: operation.fromIndex,
      o: operation.toIndex
    };
  }
}

export class ArrayMoveOperationDeserializer {
  static deserialize(body: any): ArrayMoveOperation {
    return new ArrayMoveOperation(body.p, body.n, body.f, body.o);
  }
}

export class ArrayRemoveOperationSerializer {
  static serialize(operation: ArrayRemoveOperation): any {
    return {
      t: OperationType.ARRAY_REMOVE,
      p: operation.path,
      n: operation.noOp,
      i: operation.index
    };
  }
}

export class ArrayRemoveOperationDeserializer {
  static deserialize(body: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(body.p, body.n, body.i);
  }
}

export class ArrayReplaceOperationSerializer {
  static serialize(operation: ArrayReplaceOperation): any {
    return {
      t: OperationType.ARRAY_REPLACE,
      p: operation.path,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class ArrayReplaceOperationDeserializer {
  static deserialize(body: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(body.p, body.n, body.i, body.v);
  }
}

export class ArraySetOperationSerializer {
  static serialize(operation: ArraySetOperation): any {
    return {
      t: OperationType.ARRAY_SET,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class ArraySetOperationDeserializer {
  static deserialize(body: any): ArraySetOperation {
    return new ArraySetOperation(body.p, body.n, body.v);
  }
}

export class BooleanSetOperationSerializer {
  static serialize(operation: BooleanSetOperation): any {
    return {
      t: OperationType.BOOLEAN_SET,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class BooleanSetOperationDeserializer {
  static deserialize(body: any): BooleanSetOperation {
    return new BooleanSetOperation(body.p, body.n, body.v);
  }
}

export class NumberAddOperationSerializer {
  static serialize(operation: NumberAddOperation): any {
    return {
      t: OperationType.NUMBER_ADD,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class NumberAddOperationDeserializer {
  static deserialize(body: any): NumberAddOperation {
    return new NumberAddOperation(body.p, body.n, body.v);
  }
}

export class NumberSetOperationSerializer {
  static serialize(operation: NumberSetOperation): any {
    return {
      t: OperationType.NUMBER_SET,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class NumberSetOperationDeserializer {
  static deserialize(body: any): NumberSetOperation {
    return new NumberSetOperation(body.p, body.n, body.v);
  }
}

export class ObjectAddPropertyOperationSerializer {
  static serialize(operation: ObjectAddPropertyOperation): any {
    return {
      t: OperationType.OBJECT_ADD_PROPERTY,
      p: operation.path,
      n: operation.noOp,
      k: operation.prop,
      v: operation.value
    };
  }
}

export class ObjectAddPropertyOperationDeserializer {
  static deserialize(body: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(body.p, body.n, body.k, body.v);
  }
}

export class ObjectRemovePropertyOperationSerializer {
  static serialize(operation: ObjectRemovePropertyOperation): any {
    return {
      t: OperationType.OBJECT_REMOVE_PROPERTY,
      p: operation.path,
      n: operation.noOp,
      k: operation.prop
    };
  }
}

export class ObjectRemovePropertyOperationDeserializer {
  static deserialize(body: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(body.p, body.n, body.k);
  }
}

export class ObjectSetPropertyOperationSerializer {
  static serialize(operation: ObjectSetPropertyOperation): any {
    return {
      t: OperationType.OBJECT_SET_PROPERTY,
      p: operation.path,
      n: operation.noOp,
      k: operation.prop,
      v: operation.value
    };
  }
}

export class ObjectSetPropertyOperationDeserializer {
  static deserialize(body: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(body.p, body.n, body.k, body.v);
  }
}

export class ObjectSetOperationSerializer {
  static serialize(operation: ObjectSetOperation): any {
    return {
      t: OperationType.OBJECT_SET,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class ObjectSetOperationDeserializer {
  static deserialize(body: any): ObjectSetOperation {
    return new ObjectSetOperation(body.p, body.n, body.v);
  }
}

export class StringInsertOperationSerializer {
  static serialize(operation: StringInsertOperation): any {
    return {
      t: OperationType.STRING_INSERT,
      p: operation.path,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class StringInsertOperationDeserializer {
  static deserialize(body: any): StringInsertOperation {
    return new StringInsertOperation(body.p, body.n, body.i, body.v);
  }
}

export class StringRemoveOperationSerializer {
  static serialize(operation: StringRemoveOperation): any {
    return {
      t: OperationType.STRING_REMOVE,
      p: operation.path,
      n: operation.noOp,
      i: operation.index,
      v: operation.value
    };
  }
}

export class StringRemoveOperationDeserializer {
  static deserialize(body: any): StringRemoveOperation {
    return new StringRemoveOperation(body.p, body.n, body.i, body.v);
  }
}

export class StringSetOperationSerializer {
  static serialize(operation: StringSetOperation): any {
    return {
      t: OperationType.STRING_SET,
      p: operation.path,
      n: operation.noOp,
      v: operation.value
    };
  }
}

export class StringSetOperationDeserializer {
  static deserialize(body: any): StringSetOperation {
    return new StringSetOperation(body.p, body.n, body.v);
  }
}

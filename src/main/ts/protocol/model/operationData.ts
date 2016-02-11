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
    switch(operation.type) {

    }
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
      case "AI":
        return ArrayInsertOperationDeserializer.deserialize(body);
      case "AM":
        return ArrayMoveOperationDeserializer.deserialize(body);
      case "AR":
        return ArrayRemoveOperationDeserializer.deserialize(body);
      case "AP":
        return ArrayReplaceOperationDeserializer.deserialize(body);
      case "AS":
        return ArraySetOperationDeserializer.deserialize(body);
      case "BS":
        return BooleanSetOperationDeserializer.deserialize(body);
      case "NA":
        return NumberAddOperationDeserializer.deserialize(body);
      case "NS":
        return NumberSetOperationDeserializer.deserialize(body);
      case "OA":
        return ObjectAddPropertyOperationDeserializer.deserialize(body);
      case "OR":
        return ObjectRemovePropertyOperationDeserializer.deserialize(body);
      case "OP":
        return ObjectSetPropertyOperationDeserializer.deserialize(body);
      case "OS":
        return ObjectSetOperationDeserializer.deserialize(body);
      case "SI":
        return StringInsertOperationDeserializer.deserialize(body);
      case "SR":
        return StringRemoveOperationDeserializer.deserialize(body);
      case "SS":
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
    return  {
      t: "C",
      ops: ops

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
      t: "AI",
      path: operation.path,
      noOp: operation.noOp,
      idx: operation.index,
      val: operation.value
    };
  }
}

export class ArrayInsertOperationDeserializer {
  static deserialize(body: any): ArrayInsertOperation {
    return new ArrayInsertOperation(body.path, body.noOp, body.idx, body.val);
  }
}

export class ArrayMoveOperationSerializer {
  static serialize(operation: ArrayMoveOperation): any {
    return {
      t: "AM",
      path: operation.path,
      noOp: operation.noOp,
      fromIdx: operation.fromIndex,
      toIdx: operation.toIndex
    };
  }
}

export class ArrayMoveOperationDeserializer {
  static deserialize(body: any): ArrayMoveOperation {
    return new ArrayMoveOperation(body.path, body.noOp, body.fromIdx, body.toIdx);
  }
}

export class ArrayRemoveOperationSerializer {
  static serialize(operation: ArrayRemoveOperation): any {
    return {
      t: "AR",
      path: operation.path,
      noOp: operation.noOp,
      idx: operation.index
    };
  }
}

export class ArrayRemoveOperationDeserializer {
  static deserialize(body: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(body.path, body.noOp, body.idx);
  }
}

export class ArrayReplaceOperationSerializer {
  static serialize(operation: ArrayReplaceOperation): any {
    return {
      t: "AP",
      path: operation.path,
      noOp: operation.noOp,
      idx: operation.index,
      val: operation.value
    };
  }
}

export class ArrayReplaceOperationDeserializer {
  static deserialize(body: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(body.path, body.noOp, body.idx, body.val);
  }
}

export class ArraySetOperationSerializer {
  static serialize(operation: ArraySetOperation): any {
    return {
      t: "AS",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class ArraySetOperationDeserializer {
  static deserialize(body: any): ArraySetOperation {
    return new ArraySetOperation(body.path, body.noOp, body.val);
  }
}

export class BooleanSetOperationSerializer {
  static serialize(operation: BooleanSetOperation): any {
    return {
      t: "BS",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class BooleanSetOperationDeserializer {
  static deserialize(body: any): BooleanSetOperation {
    return new BooleanSetOperation(body.path, body.noOp, body.val);
  }
}

export class NumberAddOperationSerializer {
  static serialize(operation: NumberAddOperation): any {
    return {
      t: "NA",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class NumberAddOperationDeserializer {
  static deserialize(body: any): NumberAddOperation {
    return new NumberAddOperation(body.path, body.noOp, body.val);
  }
}

export class NumberSetOperationSerializer {
  static serialize(operation: NumberSetOperation): any {
    return {
      t: "NS",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class NumberSetOperationDeserializer {
  static deserialize(body: any): NumberSetOperation {
    return new NumberSetOperation(body.path, body.noOp, body.val);
  }
}

export class ObjectAddPropertyOperationSerializer {
  static serialize(operation: ObjectAddPropertyOperation): any {
    return {
      t: "OA",
      path: operation.path,
      noOp: operation.noOp,
      prop: operation.prop,
      val: operation.value
    };
  }
}

export class ObjectAddPropertyOperationDeserializer {
  static deserialize(body: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(body.path, body.noOp, body.prop, body.val);
  }
}

export class ObjectRemovePropertyOperationSerializer {
  static serialize(operation: ObjectRemovePropertyOperation): any {
    return {
      t: "OR",
      path: operation.path,
      noOp: operation.noOp,
      prop: operation.prop
    };
  }
}

export class ObjectRemovePropertyOperationDeserializer {
  static deserialize(body: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(body.path, body.noOp, body.prop);
  }
}

export class ObjectSetPropertyOperationSerializer {
  static serialize(operation: ObjectSetPropertyOperation): any {
    return {
      t: "OP",
      path: operation.path,
      noOp: operation.noOp,
      prop: operation.prop,
      val: operation.value
    };
  }
}

export class ObjectSetPropertyOperationDeserializer {
  static deserialize(body: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(body.path, body.noOp, body.prop, body.val);
  }
}

export class ObjectSetOperationSerializer {
  static serialize(operation: ObjectSetOperation): any {
    return {
      t: "OS",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class ObjectSetOperationDeserializer {
  static deserialize(body: any): ObjectSetOperation {
    return new ObjectSetOperation(body.path, body.noOp, body.val);
  }
}

export class StringInsertOperationSerializer {
  static serialize(operation: StringInsertOperation): any {
    return {
      t: "SI",
      path: operation.path,
      noOp: operation.noOp,
      idx: operation.index,
      val: operation.value
    };
  }
}

export class StringInsertOperationDeserializer {
  static deserialize(body: any): StringInsertOperation {
    return new StringInsertOperation(body.path, body.noOp, body.idx, body.val);
  }
}

export class StringRemoveOperationSerializer {
  static serialize(operation: StringRemoveOperation): any {
    return {
      t: "SR",
      path: operation.path,
      noOp: operation.noOp,
      idx: operation.index,
      val: operation.value
    };
  }
}

export class StringRemoveOperationDeserializer {
  static deserialize(body: any): StringRemoveOperation {
    return new StringRemoveOperation(body.path, body.noOp, body.idx, body.val);
  }
}

export class StringSetOperationSerializer {
  static serialize(operation: StringSetOperation): any {
    return {
      t: "SS",
      path: operation.path,
      noOp: operation.noOp,
      val: operation.value
    };
  }
}

export class StringSetOperationDeserializer {
  static deserialize(body: any): StringSetOperation {
    return new StringSetOperation(body.path, body.noOp, body.val);
  }
}

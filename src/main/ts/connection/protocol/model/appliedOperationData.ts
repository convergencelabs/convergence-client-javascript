import {AppliedOperation} from "../../../model/ot/applied/AppliedOperation";
import {OperationType} from "../../../model/ot/ops/OperationType";
import {AppliedCompoundOperation} from "../../../model/ot/applied/AppliedCompoundOperation";
import {AppliedArrayInsertOperation} from "../../../model/ot/applied/AppliedArrayInsertOperation";
import {DataValueDeserializer} from "./dataValue";
import {AppliedArrayMoveOperation} from "../../../model/ot/applied/AppliedArrayMoveOperation";
import {AppliedArrayRemoveOperation} from "../../../model/ot/applied/AppliedArrayRemoveOperation";
import {AppliedArrayReplaceOperation} from "../../../model/ot/applied/AppliedArrayReplaceOperation";
import {AppliedArraySetOperation} from "../../../model/ot/applied/AppliedArraySetOperation";
import {AppliedBooleanSetOperation} from "../../../model/ot/applied/AppliedBooleanSetOperation";
import {AppliedNumberAddOperation} from "../../../model/ot/applied/AppliedNumberAddOperation";
import {AppliedNumberSetOperation} from "../../../model/ot/applied/AppliedNumberSetOperation";
import {AppliedObjectAddPropertyOperation} from "../../../model/ot/applied/AppliedObjectAddPropertyOperation";
import {AppliedObjectRemovePropertyOperation} from "../../../model/ot/applied/AppliedObjectRemovePropertyOperation";
import {AppliedObjectSetPropertyOperation} from "../../../model/ot/applied/AppliedObjectSetPropertyOperation";
import {AppliedObjectSetOperation} from "../../../model/ot/applied/AppliedObjectSetOperation";
import {AppliedStringInsertOperation} from "../../../model/ot/applied/AppliedStringInsertOperation";
import {AppliedStringRemoveOperation} from "../../../model/ot/applied/AppliedStringRemoveOperation";
import {AppliedStringSetOperation} from "../../../model/ot/applied/AppliedStringSetOperation";
import {CodeMap} from "../../../util/CodeMap";
import {mapObject} from "../../../util/ObjectUtils";
import {ModelOperation} from "../../../model/ot/applied/ModelOperation";
import {AppliedDiscreteOperation} from "../../../model/ot/applied/AppliedDiscreteOperation";
import {AppliedDateSetOperation} from "../../../model/ot/applied/AppliedDateSetOperation";

const OperationTypeCodes: CodeMap = new CodeMap();
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

/**
 * @hidden
 * @internal
 */
export class ModelOperationDeserializer {
  public static deserialize(body: any): ModelOperation {
    return new ModelOperation(body.m, body.v, body.p, body.u, body.s,
      AppliedOperationDeserializer.deserialize(body.o));
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedOperationDeserializer {
  public static deserialize(body: any): AppliedOperation {
    switch (OperationTypeCodes.value(body.t)) {
      case OperationType.COMPOUND:
        return AppliedCompoundDeserializer.deserialize(body);
      case OperationType.ARRAY_INSERT:
        return AppliedArrayInsertOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REORDER:
        return AppliedArrayMoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_REMOVE:
        return AppliedArrayRemoveOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_SET:
        return AppliedArrayReplaceOperationDeserializer.deserialize(body);
      case OperationType.ARRAY_VALUE:
        return AppliedArraySetOperationDeserializer.deserialize(body);
      case OperationType.BOOLEAN_VALUE:
        return AppliedBooleanSetOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_ADD:
        return AppliedNumberAddOperationDeserializer.deserialize(body);
      case OperationType.NUMBER_VALUE:
        return AppliedNumberSetOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_ADD:
        return AppliedObjectAddPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_REMOVE:
        return AppliedObjectRemovePropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_SET:
        return AppliedObjectSetPropertyOperationDeserializer.deserialize(body);
      case OperationType.OBJECT_VALUE:
        return AppliedObjectSetOperationDeserializer.deserialize(body);
      case OperationType.STRING_INSERT:
        return AppliedStringInsertOperationDeserializer.deserialize(body);
      case OperationType.STRING_REMOVE:
        return AppliedStringRemoveOperationDeserializer.deserialize(body);
      case OperationType.STRING_VALUE:
        return AppliedStringSetOperationDeserializer.deserialize(body);
      case OperationType.DATE_VALUE:
        return AppliedDateSetOperationDeserializer.deserialize(body);
      default:
        throw new Error("Can't deserialize unknown operation type: " + body.t);
    }
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedCompoundDeserializer {
  public static deserialize(body: any): AppliedCompoundOperation {
    const ops: AppliedDiscreteOperation[] = [];
    let op: AppliedDiscreteOperation;
    for (op of body.o) {
      ops.push(<AppliedDiscreteOperation> AppliedOperationDeserializer.deserialize(op));
    }
    return new AppliedCompoundOperation(ops);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedArrayInsertOperationDeserializer {
  public static deserialize(body: any): AppliedArrayInsertOperation {
    return new AppliedArrayInsertOperation(body.d, body.n, body.i, DataValueDeserializer(body.v));
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedArrayMoveOperationDeserializer {
  public static deserialize(body: any): AppliedArrayMoveOperation {
    return new AppliedArrayMoveOperation(body.d, body.n, body.f, body.o);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedArrayRemoveOperationDeserializer {
  public static deserialize(body: any): AppliedArrayRemoveOperation {
    return new AppliedArrayRemoveOperation(body.d, body.n, body.i, body.o ? DataValueDeserializer(body.o) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedArrayReplaceOperationDeserializer {
  public static deserialize(body: any): AppliedArrayReplaceOperation {
    return new AppliedArrayReplaceOperation(body.d, body.n, body.i, DataValueDeserializer(body.v),
      body.o ? DataValueDeserializer(body.o) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedArraySetOperationDeserializer {
  public static deserialize(body: any): AppliedArraySetOperation {
    return new AppliedArraySetOperation(body.d, body.n, body.v.map((value: any) => DataValueDeserializer(value)),
      body.o ? body.o.map((value: any) => DataValueDeserializer(value)) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedBooleanSetOperationDeserializer {
  public static deserialize(body: any): AppliedBooleanSetOperation {
    return new AppliedBooleanSetOperation(body.d, body.n, body.v, body.o ? body.o : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedNumberAddOperationDeserializer {
  public static deserialize(body: any): AppliedNumberAddOperation {
    return new AppliedNumberAddOperation(body.d, body.n, body.v);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedNumberSetOperationDeserializer {
  public static deserialize(body: any): AppliedNumberSetOperation {
    return new AppliedNumberSetOperation(body.d, body.n, body.v, body.o ? body.o : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedObjectAddPropertyOperationDeserializer {
  public static deserialize(body: any): AppliedObjectAddPropertyOperation {
    return new AppliedObjectAddPropertyOperation(body.d, body.n, body.p, DataValueDeserializer(body.v));
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedObjectRemovePropertyOperationDeserializer {
  public static deserialize(body: any): AppliedObjectRemovePropertyOperation {
    return new AppliedObjectRemovePropertyOperation(body.d, body.n, body.p,
      body.o ? DataValueDeserializer(body.o) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetPropertyOperationDeserializer {
  public static deserialize(body: any): AppliedObjectSetPropertyOperation {
    return new AppliedObjectSetPropertyOperation(body.d, body.n, body.p, DataValueDeserializer(body.v),
      body.o ? DataValueDeserializer(body.o) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetOperationDeserializer {
  public static deserialize(body: any): AppliedObjectSetOperation {
    return new AppliedObjectSetOperation(body.d, body.n,
      mapObject(body.v, (value: any) => DataValueDeserializer(value)),
      body.o ? mapObject(body.o, (value: any) => DataValueDeserializer(value)) : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedStringInsertOperationDeserializer {
  public static deserialize(body: any): AppliedStringInsertOperation {
    return new AppliedStringInsertOperation(body.d, body.n, body.i, body.v);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedStringRemoveOperationDeserializer {
  public static deserialize(body: any): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(body.d, body.n, body.i, body.l, body.o);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedStringSetOperationDeserializer {
  public static deserialize(body: any): AppliedStringSetOperation {
    return new AppliedStringSetOperation(body.d, body.n, body.v, body.o ? body.o : null);
  }
}

/**
 * @hidden
 * @internal
 */
export class AppliedDateSetOperationDeserializer {
  public static deserialize(body: any): AppliedDateSetOperation {
    return new AppliedDateSetOperation(body.d, body.n, new Date(body.v), body.o ? new Date(body.o) : null);
  }
}

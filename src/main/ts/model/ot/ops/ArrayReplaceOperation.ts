import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";
import {ArrayReplace} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ArrayReplaceOperation extends DiscreteOperation implements ArrayReplace {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: DataValue) {
    super(OperationType.ARRAY_SET, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

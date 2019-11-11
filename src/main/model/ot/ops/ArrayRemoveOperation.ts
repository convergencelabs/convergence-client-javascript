import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {ArrayRemove} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ArrayRemoveOperation extends DiscreteOperation implements ArrayRemove {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number) {
    super(OperationType.ARRAY_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index));
  }
}

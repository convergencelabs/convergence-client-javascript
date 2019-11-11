import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";
import {ObjectSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ObjectSetOperation extends DiscreteOperation implements ObjectSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: { [key: string]: DataValue }) {
    super(OperationType.OBJECT_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ObjectSetOperation {
    return new ObjectSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

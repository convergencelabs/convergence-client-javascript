import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {NumberDelta} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class NumberDeltaOperation extends DiscreteOperation implements NumberDelta {

  constructor(id: string,
              noOp: boolean,
              public readonly delta: number) {
    super(OperationType.NUMBER_DELTA, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): NumberDeltaOperation {
    return new NumberDeltaOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.delta, updates.delta));
  }
}

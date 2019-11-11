import {DiscreteChange} from "./ot/ops/operationChanges";
import {DomainUser} from "../identity";

/**
 * @hidden
 * @internal
 */
export class ModelOperationEvent {
  /**
   * Constructs a new ModelOperationEvent.
   * @hidden
   * @internal
   */
  constructor(public sessionId: string,
              public user: DomainUser,
              public version: number,
              public timestamp: Date,
              public operation: DiscreteChange) {

    Object.freeze(this);
  }
}

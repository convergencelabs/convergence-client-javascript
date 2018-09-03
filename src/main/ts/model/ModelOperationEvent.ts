import {DiscreteChange} from "./ot/ops/operationChanges";

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
              public username: string,
              public version: number,
              public timestamp: number,
              public operation: DiscreteChange) {

    Object.freeze(this);
  }
}

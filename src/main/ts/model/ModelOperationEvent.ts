import {DiscreteChange} from "./ot/ops/operationChanges";

export class ModelOperationEvent {
  /**
   * Constructs a new ModelOperationEvent.
   */
  constructor(public sessionId: string,
              public username: string,
              public version: number,
              public timestamp: number,
              public operation: DiscreteChange) {

    Object.freeze(this);
  }
}

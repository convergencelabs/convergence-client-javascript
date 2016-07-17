import {DiscreteOperation} from "./ot/ops/DiscreteOperation";

export class ModelOperationEvent {
  /**
   * Constructs a new ModelOperationEvent.
   */
  constructor(public sessionId: string,
              public userId: string,
              public version: number,
              public timestamp: number,
              public operation: DiscreteOperation) {

    Object.freeze(this);
  }
}
